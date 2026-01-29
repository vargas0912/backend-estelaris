const Sequencer = require('@jest/test-sequencer').default;

class AlphabeticalSequencer extends Sequencer {
  /**
   * Sort test files alphabetically to ensure consistent execution order.
   * This is critical for tests that depend on database state (e.g., first superadmin registration).
   */
  sort(tests) {
    const copyTests = Array.from(tests);
    return copyTests.sort((testA, testB) => {
      return testA.path.localeCompare(testB.path);
    });
  }
}

module.exports = AlphabeticalSequencer;
