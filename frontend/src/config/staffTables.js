export const STAFF_TABLES = [
  {
    key: "patient",
    title: "Patient",
    primaryKey: "patient_id",
    fields: [
      { name: "patient_name", label: "Patient Name", type: "text", required: true },
      { name: "gender", label: "Gender", type: "text", nullable: true },
      { name: "age", label: "Age", type: "number", nullable: true },
      { name: "phone_num", label: "Phone", type: "text", nullable: true },
      { name: "address", label: "Address", type: "textarea", nullable: true },
      { name: "blood_group", label: "Blood Group", type: "text", nullable: true },
      { name: "registration_date", label: "Registration Date", type: "date", nullable: true },
    ],
  },
  {
    key: "appointment",
    title: "Appointment",
    primaryKey: "appointment_id",
    fields: [
      { name: "patient_id", label: "patient_id", type: "number", required: true },
      { name: "doctor_id", label: "doctor_id", type: "number", required: true },
      { name: "dept_id", label: "dept_id", type: "number", nullable: true },
      { name: "appointment_date", label: "Appointment Date", type: "date", required: true },
      { name: "appointment_time", label: "Appointment Time", type: "time", required: true },
      {
        name: "status",
        label: "Status",
        type: "select",
        nullable: true,
        options: ["pending", "completed", "cancelled"],
      },
    ],
  },
  {
    key: "consultation_billing",
    title: "Consultation_Billing",
    primaryKey: "consultation_bill_id",
    fields: [
      { name: "appointment_id", label: "appointment_id", type: "number", required: true },
      { name: "amount", label: "Amount", type: "number", nullable: true },
      {
        name: "payment_status",
        label: "Payment Status",
        type: "select",
        nullable: true,
        options: ["pending", "paid", "failed"],
      },
      { name: "payment_date", label: "Payment Date", type: "date", nullable: true },
    ],
  },
];
