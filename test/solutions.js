let server = require("../app");
let chai = require("chai");
let chaiHttp = require("chai-http");

// Assertion 
chai.should();
chai.use(chaiHttp); 

describe('Solutions APIs', () => {
    it("Test 400 error for targeted entity", (done) => {
        chai.request(server)
        .get("/kendra/api/v1/solutions/targetedEntity")
        .end((err, response) => {
            chai.expect(response.status).to.equal(401);
            done();
        });
    });
})