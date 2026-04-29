import { Resend } from "resend";
const resend = new Resend("test");
const audienceId = "5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d";
const segmentId = "cd27fc2d-8077-4580-9404-9190a982020a";

resend.contacts.create({
  email: "test@example.com",
  firstName: "A",
  lastName: "B",
  audienceId: audienceId, // or omit audience array?
});

resend.contacts.create({
  email: "test2@example.com",
  segments: [
    { id: segmentId }
  ]
});
