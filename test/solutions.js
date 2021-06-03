let chai = require("chai");
let chaiHttp = require("chai-http");

// Assertion 
chai.should();
chai.use(chaiHttp); 

describe('Solutions APIs', () => {
    it("Sample test", (done) => {
        done();
    });
})