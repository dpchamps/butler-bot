import {multiline} from "./util";

describe("Utility Tests", () => {
    it("Should format into multi lines", () => {
        expect(multiline("a", 'b', 'c')).toBe("a\nb\nc")
    });
});
