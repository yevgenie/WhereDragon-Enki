import test from "tape";
import {
  extractDayNumberAfterKing,
  extractMHNMPartOfChannelName,
  extractNumberAfterX,
  validFirstXinPattern,
  validJobXinPattern,
  validXKillPattern,
  validXKillPatternTiamat,
} from "../helpers/channelToDKP";
import { extractValidWindowsFromProcessCommand } from "..";

test("extractNumberAfterX function", (t) => {
  t.plan(6);

  t.equal(extractNumberAfterX("x1"), 1, 'Should return 1 for "x1"');
  t.equal(extractNumberAfterX("x-1"), 1, 'Should return 1 for "x-1"');
  t.equal(extractNumberAfterX("x 1"), 1, 'Should return 1 for "x 1"');
  t.equal(extractNumberAfterX("x2"), 2, 'Should return 2 for "x2"');
  t.equal(extractNumberAfterX("x"), null, 'Should return null for "x"');

  t.equal(
    extractNumberAfterX("X2 darkfarkee"),
    2,
    'Should return 2 for "X2 darkfarkee"'
  );
});

test("extractMHNMPartOfChannelName", async (t) => {
  t.plan(10);

  t.equal(extractMHNMPartOfChannelName("sep18-shi"), "shi");
  t.equal(extractMHNMPartOfChannelName("sep18-kv"), "kv");
  t.equal(extractMHNMPartOfChannelName("sep18-sim"), "sim");
  t.equal(extractMHNMPartOfChannelName("sep18-ada2"), "ada");
  t.equal(extractMHNMPartOfChannelName("sep18-beh7"), "beh");
  t.equal(extractMHNMPartOfChannelName("sep01-ada2"), "ada");
  t.equal(extractMHNMPartOfChannelName("sep01-beh7"), "beh");

  t.equal(extractMHNMPartOfChannelName("nov28-jorm-cta"), "jorm");
  t.equal(extractMHNMPartOfChannelName("nov28-vrt"), "vrt");
  t.equal(extractMHNMPartOfChannelName("nov24-vrtra"), "vrtra");

  t.end();
});

test("extractMHNMPartOfChannelName", async (t) => {
  t.plan(7);

  t.equal(extractDayNumberAfterKing("sep18-ada2"), 2);
  t.equal(extractDayNumberAfterKing("sep1-beh7"), 7);
  t.equal(extractDayNumberAfterKing("nov01-ada2"), 2);
  t.equal(extractDayNumberAfterKing("sep01-beh7"), 7);
  t.equal(extractDayNumberAfterKing("sep01-sim"), null);
  t.equal(extractDayNumberAfterKing("sep01-ka2"), null);
  t.equal(extractDayNumberAfterKing("sep01-beh"), null);

  t.end();
});

test("Valid Alt Xin Pattern", (t) => {
  t.plan(12);

  // Test case for single 'x'
  t.ok(validFirstXinPattern.test("x"), 'Matches single "x"');

  // Test cases for 'x' followed by allowed patterns
  t.ok(validFirstXinPattern.test("x scout"), 'Matches "x scout"');
  t.ok(validFirstXinPattern.test("x (ka scout)"), "Matches x in");
  t.ok(validFirstXinPattern.test("X-KV scout"), "Matches x in");
  t.ok(validFirstXinPattern.test("x abc"), 'Matches "x abc"');

  t.ok(
    validFirstXinPattern.test("X (forgot to x in at start)"),
    "Should Match X"
  );

  t.ok(
    validFirstXinPattern.test("x Scout"),
    'Matches "x Scout" (case-insensitive)'
  );

  t.ok(
    validFirstXinPattern.test("X (forgot to x in at start)"),
    "Matches x forgot to x in at start"
  );

  t.ok(validFirstXinPattern.test("x 3 scout"), 'Does not match "x 3 scout"');

  // Test cases for patterns that should not match
  t.notOk(validFirstXinPattern.test("x out"), 'Does not match "x out"');
  t.notOk(
    validFirstXinPattern.test("x Out"),
    'Does not match "x Out" (case-insensitive)'
  );
  t.notOk(validFirstXinPattern.test("x2"), 'Does not match "x2"');

  t.end();
});

test("Valid X Kill Pattern", (t) => {
  t.plan(5);

  // Test case where 'kill' follows 'x'
  t.ok(validXKillPattern.test("x kill"), 'Matches "x kill"');
  t.ok(
    validXKillPattern.test("x something kill"),
    'Matches "x something kill"'
  );
  t.ok(validXKillPattern.test("X KILL"), 'Matches "X KILL" (case-insensitive)');

  // Test case where 'kill' does not follow 'x' or is not present
  t.notOk(validXKillPattern.test("x"), 'Does not match "x" alone');
  t.notOk(validXKillPattern.test("kill x"), 'Does not match "kill x"');

  t.end();
});

test("Valid X Kill Pattern Tiamat", (t) => {
  t.plan(9);

  // Test cases where 'kill' and a three-letter word are present in either order
  t.ok(validXKillPatternTiamat.test("x kill abc"), 'Matches "x kill abc"');
  t.ok(validXKillPatternTiamat.test("x abc kill"), 'Matches "x abc kill"');
  t.ok(
    validXKillPatternTiamat.test("x something kill def"),
    'Matches "x something kill def"'
  );
  t.ok(
    validXKillPatternTiamat.test("x ghi kill something"),
    'Matches "x ghi kill something"'
  );
  t.ok(
    validXKillPatternTiamat.test("X KILL JKL"),
    'Matches "X KILL JKL" (case-insensitive)'
  );

  // Test cases where the pattern should not match
  t.notOk(
    validXKillPatternTiamat.test("x kill"),
    'Does not match "x kill" without three-letter word'
  );
  t.notOk(
    validXKillPatternTiamat.test("x abc"),
    'Does not match "x abc" without "kill"'
  );
  t.notOk(
    validXKillPatternTiamat.test("kill x abc"),
    'Does not match "kill x abc"'
  );
  t.notOk(
    validXKillPatternTiamat.test("x abcdef kill"),
    "Does not match with non-three-letter word"
  );

  t.end();
});

test("Valid Job Xin Pattern for Tiamat JOB", (t) => {
  t.plan(15);

  // Positive test cases: Should match
  t.ok(validJobXinPattern.test("x scout"), 'Matches "x scout"');
  t.ok(validJobXinPattern.test("x TOD"), 'Matches "x TOD" (case-insensitive)');
  t.ok(validJobXinPattern.test("x blm"), 'Matches "x blm"');
  t.ok(validJobXinPattern.test("x rdm something"), 'Matches "x rdm something"');
  t.ok(validJobXinPattern.test("x WHM"), 'Matches "x WHM" (case-insensitive)');
  t.ok(validJobXinPattern.test("x rng"), 'Matches "x rng"');
  t.ok(validJobXinPattern.test("x SAM"), 'Matches "x SAM" (case-insensitive)');
  t.ok(validJobXinPattern.test("x nin"), 'Matches "x nin"');
  t.ok(validJobXinPattern.test("x War"), 'Matches "x War" (case-insensitive)');
  t.ok(validJobXinPattern.test("x BST"), 'Matches "x BST" (case-insensitive)');
  t.ok(validJobXinPattern.test("x drk"), 'Matches "x drk"');
  t.ok(validJobXinPattern.test("x PLD"), 'Matches "x PLD" (case-insensitive)');
  t.ok(validJobXinPattern.test("x blmrdm"), 'Does not match "x blmrdm"');

  // Negative test cases: Should not match
  t.notOk(validJobXinPattern.test("x"), 'Does not match "x" alone');
  t.notOk(
    validJobXinPattern.test("x Monk"),
    'Matches "x Monk" (case-insensitive)'
  );

  t.end();
});

test("extractValidWindowsFromProcessCommand should handle edge cases", (t) => {
  // Test case with leading/trailing spaces
  t.deepEqual(
    extractValidWindowsFromProcessCommand("!process   valid-2-3-4   "),
    [2, 3, 4],
    "Should handle leading/trailing spaces"
  );

  // Test case with hyphenated text before valid-
  t.deepEqual(
    extractValidWindowsFromProcessCommand("!process text-with-hyphens valid-2"),
    [2],
    "Should handle text with hyphens before valid-"
  );

  t.end();
});
