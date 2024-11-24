import test from "tape";
import { extractNumberAfterX } from "../helpers/channelToDKP";

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
