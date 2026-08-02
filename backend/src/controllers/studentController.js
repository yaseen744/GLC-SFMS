import { Student } from "../models/Student.js";
import { FeeRecord } from "../models/FeeRecord.js";

export async function listStudents(req, res) {
  try {
    const query = {};
    if (req.query.class) {
      query.class = req.query.class;
    }
    const students = await Student.find(query).sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getStudent(req, res) {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const fees = await FeeRecord.find({ student: student._id }).sort({ year: -1, month: -1 });
    res.json({ student, fees });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createStudent(req, res) {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "A student with this code already exists" });
    }
    res.status(400).json({ message: err.message });
  }
}

export async function updateStudent(req, res) {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function deleteStudent(req, res) {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    await FeeRecord.deleteMany({ student: student._id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
