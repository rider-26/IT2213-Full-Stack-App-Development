// Unit tests for UC-004: Review & Approve Payroll
const request = require("supertest");
const app = require("../src/app");
const Approval = require("../src/models/Approval");

beforeEach(() => {
  Approval.resetSampleData();
});

describe("GET /api/approvals", () => {
  it("returns only records that are pending approval", async () => {
    const res = await request(app).get("/api/approvals");
    expect(res.status).toBe(200);
    expect(res.body.records.length).toBeGreaterThan(0);
    res.body.records.forEach((record) => {
      expect(record.status).toBe("pending_approval");
    });
  });
});

describe("POST /api/approvals/:id/approve", () => {
  it("approves a pending record", async () => {
    const res = await request(app)
      .post("/api/approvals/1/approve")
      .send({ approvedBy: "Managing Director" });

    expect(res.status).toBe(200);
    expect(res.body.record.status).toBe("approved");
    expect(res.body.record.approvedBy).toBe("Managing Director");
  });

  it("returns 404 for a record that does not exist", async () => {
    const res = await request(app).post("/api/approvals/999/approve").send({});
    expect(res.status).toBe(404);
  });

  it("returns 409 if the record was already decided", async () => {
    await request(app).post("/api/approvals/1/approve").send({});
    const res = await request(app).post("/api/approvals/1/approve").send({});
    expect(res.status).toBe(409);
  });
});

describe("POST /api/approvals/:id/reject", () => {
  it("rejects a record when a comment is provided", async () => {
    const res = await request(app)
      .post("/api/approvals/2/reject")
      .send({ approvedBy: "Managing Director", comment: "Hours look wrong, please recheck" });

    expect(res.status).toBe(200);
    expect(res.body.record.status).toBe("rejected");
    expect(res.body.record.comment).toBe("Hours look wrong, please recheck");
  });

  it("returns 422 if no comment is provided", async () => {
    const res = await request(app)
      .post("/api/approvals/2/reject")
      .send({ approvedBy: "Managing Director" });
    expect(res.status).toBe(422);
  });
});
