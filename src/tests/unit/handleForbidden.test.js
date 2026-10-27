const { handleForbidden, handleServerError } = require('../../utils/handleErorr');
const logger = require('../../utils/logger');
const { FORBIDDEN } = require('../../constants/forbidden');

const mockRes = () => ({ status: jest.fn().mockReturnThis(), send: jest.fn() });

describe('handleForbidden', () => {
  test.each(Object.keys(FORBIDDEN))('%s responde 403 con error y code', (code) => {
    const res = mockRes();
    handleForbidden(res, code);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith({ error: FORBIDDEN[code], code });
  });

  test('todos los mensajes son texto para el usuario, no claves', () => {
    Object.entries(FORBIDDEN).forEach(([code, message]) => {
      expect(message).not.toBe(code);
      expect(message).toMatch(/\s/);
    });
  });
});

describe('handleForbidden con code no registrado', () => {
  test('responde 403 con mensaje de permiso y registra el error', () => {
    const logSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});
    const res = mockRes();
    handleForbidden(res, 'TYPO_CODE');
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith({ error: FORBIDDEN.ERROR_NOT_PERMISSION, code: 'TYPO_CODE' });
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('TYPO_CODE'));
    logSpy.mockRestore();
  });
});

describe('handleServerError', () => {
  test('responde 500 con mensaje genérico y code, sin filtrar el detalle técnico', () => {
    const logSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});
    const res = mockRes();
    handleServerError(res, 'ERROR_GET_RECORDS', new Error('SequelizeDatabaseError: secret detail'));
    expect(res.status).toHaveBeenCalledWith(500);
    const body = res.send.mock.calls[0][0];
    expect(body.code).toBe('ERROR_GET_RECORDS');
    expect(body.error).toBe('Ocurrió un error inesperado. Intenta de nuevo más tarde.');
    expect(JSON.stringify(body)).not.toMatch(/secret detail/);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('secret detail'));
    logSpy.mockRestore();
  });
});
