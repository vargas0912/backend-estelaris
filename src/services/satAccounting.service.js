const { create } = require('xmlbuilder2');
const {
  accountingPeriods,
  accountingAccounts,
  accountingVouchers,
  accountingVoucherLines,
  companyInfo,
  sequelize
} = require('../models/index');

// ─── Constantes SAT 1.3 ───────────────────────────────────────────────────────

const NS_CATALOG = 'http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/CatalogoCuentas';
const NS_POLIZAS = 'http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/PolizasPeriodo';
const NS_XSI = 'http://www.w3.org/2001/XMLSchema-instance';
const XSD_CATALOG = `${NS_CATALOG}/CatalogoCuentas_1_3.xsd`;
const XSD_POLIZAS = `${NS_POLIZAS}/PolizasPeriodo_1_3.xsd`;

/**
 * Mapeo de type interno → CodAgrup SAT (agrupadores nivel 1 del SAT).
 * Persona moral — catálogo de agrupadores SAT Anexo 24.
 */
const COD_AGRUP_MAP = {
  activo: '100',
  pasivo: '200',
  capital: '300',
  ingreso: '401',
  costo: '501',
  egreso: '601'
};

/**
 * Naturaleza interna → código SAT.
 * D = Deudora, A = Acreedora
 */
const NATUR_MAP = {
  deudora: 'D',
  acreedora: 'A'
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Formatea un número decimal a string con exactamente 2 decimales.
 * El SAT exige que Debe y Haber tengan formato numérico sin separador de miles.
 */
const fmt = (n) => parseFloat(n || 0).toFixed(2);

/**
 * Obtiene el período y valida que exista.
 */
const findPeriod = async (periodId) => {
  const period = await accountingPeriods.findByPk(periodId);
  if (!period) return null;
  return period;
};

/**
 * Obtiene el RFC de la empresa desde companyInfo.
 * Retorna 'XAXX010101000' (RFC genérico) si no hay registro.
 */
const getRFC = async () => {
  const info = await companyInfo.findOne({ attributes: ['rfc'] });
  return info?.rfc || 'XAXX010101000';
};

// ─── Generador: Catálogo de Cuentas ─────────────────────────────────────────

/**
 * Genera el XML del Catálogo de Cuentas (Anexo 24, versión 1.3).
 * Incluye todas las cuentas activas ordenadas por código.
 * Guarda el XML en accounting_periods.sat_catalog_xml.
 *
 * @param {number} periodId
 * @returns {{ xml: string } | { error: string }}
 */
const generateCatalog = async (periodId) => {
  const period = await findPeriod(periodId);
  if (!period) return { error: 'PERIOD_NOT_FOUND' };

  const rfc = await getRFC();
  const mes = String(period.month).padStart(2, '0');
  const anio = String(period.year);

  const accounts = await accountingAccounts.findAll({
    where: { active: true },
    order: [['code', 'ASC']]
  });

  // Construir XML
  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele(NS_CATALOG, 'catalogocuentas:Catalogo', {
      'xmlns:catalogocuentas': NS_CATALOG,
      'xmlns:xsi': NS_XSI,
      'xsi:schemaLocation': `${NS_CATALOG} ${XSD_CATALOG}`,
      Version: '1.3',
      RFC: rfc,
      Mes: mes,
      Anio: anio,
      TipoSolicitud: 'AF'
    });

  for (const acc of accounts) {
    const codAgrup = COD_AGRUP_MAP[acc.type] || '100';
    const natur = NATUR_MAP[acc.nature] || 'D';

    root.ele(NS_CATALOG, 'catalogocuentas:Ctas', {
      NumCta: acc.code,
      Desc: acc.name,
      CodAgrup: codAgrup,
      Nivel: String(acc.level),
      Natur: natur
    }).up();
  }

  const xml = root.end({ prettyPrint: true });

  // Persistir en el período
  await accountingPeriods.update(
    { sat_catalog_xml: xml },
    { where: { id: periodId } }
  );

  return { xml };
};

// ─── Generador: Pólizas del Período ──────────────────────────────────────────

/**
 * Genera el XML de Pólizas del Período (Anexo 24, versión 1.3).
 * Solo incluye pólizas en status='aplicada'.
 * Guarda el XML y bloquea el período automáticamente.
 *
 * @param {number} periodId
 * @returns {{ xml: string } | { error: string }}
 */
const generateVouchers = async (periodId) => {
  const period = await findPeriod(periodId);
  if (!period) return { error: 'PERIOD_NOT_FOUND' };

  // El período debe estar cerrado o bloqueado para generar pólizas SAT
  if (period.status === 'abierto') return { error: 'PERIOD_MUST_BE_CLOSED' };

  const rfc = await getRFC();
  const mes = String(period.month).padStart(2, '0');
  const anio = String(period.year);

  // Cargar pólizas aplicadas con sus líneas y cuentas
  const vouchers = await accountingVouchers.findAll({
    where: {
      period_id: periodId,
      status: 'aplicada'
    },
    include: [
      {
        model: accountingVoucherLines,
        as: 'lines',
        include: [
          {
            model: accountingAccounts,
            as: 'account',
            attributes: ['code']
          }
        ]
      }
    ],
    order: [
      ['date', 'ASC'],
      ['folio', 'ASC'],
      [{ model: accountingVoucherLines, as: 'lines' }, 'order', 'ASC']
    ]
  });

  // Construir XML
  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele(NS_POLIZAS, 'PLZ:Polizas', {
      'xmlns:PLZ': NS_POLIZAS,
      'xmlns:xsi': NS_XSI,
      'xsi:schemaLocation': `${NS_POLIZAS} ${XSD_POLIZAS}`,
      Version: '1.3',
      RFC: rfc,
      Mes: mes,
      Anio: anio,
      TipoSolicitud: 'AF'
    });

  for (const voucher of vouchers) {
    // Formatear fecha como YYYY-MM-DD
    const fecha = voucher.date instanceof Date
      ? voucher.date.toISOString().slice(0, 10)
      : String(voucher.date).slice(0, 10);

    const polizaNode = root.ele(NS_POLIZAS, 'PLZ:Poliza', {
      NumUnIdenPol: voucher.folio,
      Fecha: fecha,
      Concepto: voucher.description || voucher.folio
    });

    for (const line of voucher.lines || []) {
      polizaNode.ele(NS_POLIZAS, 'PLZ:Transaccion', {
        NumCta: line.account?.code || '',
        Concepto: line.description || voucher.description || '',
        Debe: fmt(line.debit),
        Haber: fmt(line.credit)
      }).up();
    }

    polizaNode.up();
  }

  const xml = root.end({ prettyPrint: true });

  // Persistir y bloquear el período en una transacción
  const t = await sequelize.transaction();

  try {
    await accountingPeriods.update(
      { sat_vouchers_xml: xml, status: 'bloqueado' },
      { where: { id: periodId }, transaction: t }
    );

    await t.commit();
  } catch (err) {
    await t.rollback();
    throw err;
  }

  return { xml };
};

module.exports = { generateCatalog, generateVouchers };
