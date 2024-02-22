const fs = require("fs");
const csv = require("csv-parser");
const bcrypt = require("bcrypt");
const User = require("../../models").Users;
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "manish.naini@absyz.com",
    pass: "oulx aeas vznb vvcf",
  },
});

const sendEmail = async (userdetails) => {
  try {
    let info = await transporter.sendMail({
      from: "manish.naini@absyz.com",
      to: userdetails.email,
      subject: "Welcome to school based application",
      html: `
            <h1>Welcome ${userdetails.username}!</h1>
            <p>Your registration details:</p>
            <p>Username: ${userdetails.username} </p>
            <p>Email: ${userdetails.email}</P>
            <p>Role: ${userdetails.role}</p>
            <p>${userdetails.role === "Student" ? "Designation" : "Subject"}: ${
        userdetails.role === "Student"
          ? userdetails.designation
          : userdetails.subject
      }</p>
            <a href=http://localhost:3000/signup target=_blank>Click here to signup</a>
          `,
    });
    console.log("Message sent :%s", info.messageId);
  } catch (error) {
    console.log("Error occured while sending Email", error);
  }
};

const addTeacher = async (req, res) => {
  const csvFile = req.file;

  if (!csvFile) {
    return res.status(400).json({ message: "No CSV file uploaded" });
  }

  const teachers = [];
  const duplicateEmails = [];

  const expectedHeaders = ["username", "email", "role", "subject"];

  if (!checkCsvFormat(csvFile, expectedHeaders)) {
    return res.status(400).json({ message: "Invalid CSV file" });
  }

  const processCSV = () => {
    return new Promise((resolve, reject) => {
      const fileBuffer = csvFile.buffer.toString();
      const lines = fileBuffer.split("\n");

      const promises = lines.slice(1).map(async (line) => {
        const [username, email, role, subject] = line.split(",");

        const teacher = {
          username: username.trim(),
          email: email.trim(),
          role: role.trim(),
          subject: subject.trim(),
        };

        teachers.push(teacher);
        await sendEmail(teacher);
      });

      Promise.all(promises)
        .then(() => resolve())
        .catch(reject);
    });
  };

  try {
    await processCSV();
    const getEmail = await User.findAll();
    const filterEmail = getEmail.filter((arr) => arr.role === "Teacher");

    teachers.forEach((teacher) => {
      if (filterEmail.some((arr) => arr.email === teacher.email)) {
        duplicateEmails.push(teacher.email);
      }
    });

    if (duplicateEmails.length > 0) {
      return res
        .status(404)
        .json({ message: "Duplicate emails found", duplicateEmails });
    }
    await User.bulkCreate(teachers);
    res.status(200).json({ message: "Teachers added successfully" });
  } catch (error) {
    console.error("Internal server error", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getTeacher = async (req, res) => {
  try {
    const teacher = await User.findAll();
    const filterTeachers = teacher.filter((arr) => arr.role === "Teacher");
    const { limit, page } = req.query;
    let end = page * limit;
    let start = page * limit - 4;

    const chunkdata = filterTeachers.slice(start - 1, end);

    res.status(200).json({ data: chunkdata, count: filterTeachers.length });
  } catch (error) {
    console.log("Error retreving teacher details");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const findTeacher = await User.findByPk(id);
    if (!findTeacher) {
      console.log("teacher not found", id);
      return res.status(200).json({ message: "Teacher not found" });
    }

    const deleteCount = await User.destroy({ where: { id } });
    if (deleteCount === 0) {
      console.log("error deleting teacher");
      return res.status(404).json({ message: "Error deleting salary" });
    }

    return res.status(200).json({ message: "Teacher deleted Successfully" });
  } catch (error) {
    console.log("Internal sever error");
    return res.status(500).json({ message: "Internal server Error" });
  }
};

const addStudent = async (req, res) => {
  const csvFile = req.file;
  if (!csvFile) {
    res.status(400).json({ message: "No CSV file is uploaded" });
  }
  const students = [];
  const duplicateEmails = [];
  const expectedHeaders = ["username", "email", "role", "designation"];
  if (!checkCsvFormat(csvFile, expectedHeaders)) {
    return res.status(400).json({ message: "Invalid csv file" });
  }
  const processCSV = () => {
    return new Promise((resolve, reject) => {
      const fileBuffer = csvFile.buffer.toString();
      const lines = fileBuffer.split("\n");
      const promises = lines.slice(1).map(async (line) => {
        const [username, email, role, designation] = line.split(",");

        const student = {
          username: username.trim(),
          email: email.trim(),
          role: role.trim(),
          designation: designation.trim(),
        };

        students.push(student);
        await sendEmail(student);
      });

      Promise.all(promises)
        .then(() => resolve())
        .catch(reject);
    });
  };
  try {
    await processCSV();
    const getEmail = await User.findAll();
    const filterEmail = getEmail.filter((arr) => arr.role === "Student");
    students.forEach((student) => {
      if (filterEmail.some((arr) => arr.email === student.email)) {
        duplicateEmails.push(student.email);
      }
    });

    if (duplicateEmails.length > 0) {
      return res.status(404).json({ message: "Duplicate emails found" });
    }
    await User.bulkCreate(students);
    res.status(200).json({ message: "Students added successfully" });
  } catch (error) {
    console.error("Internal server error", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getStudent = async (req, res) => {
  try {
    const student = await User.findAll();
    const filterStudents = student.filter((arr) => arr.role === "Student");
    const { limit, page } = req.query;
    const start = page * limit - 4;
    const end = page * limit;
    const chunkdata = filterStudents.slice(start - 1, end);
    console.log(chunkdata, "chunkdata");
    res.status(200).json({ data: chunkdata, count: filterStudents.length });
  } catch (error) {
    console.log("Error retreving student details");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const findTeacher = await User.findByPk(id);
    if (!findTeacher) {
      console.log("student not found", id);
      return res.status(200).json({ message: "Student not found" });
    }

    const deleteCount = await User.destroy({ where: { id } });
    if (deleteCount === 0) {
      console.log("error deleting teacher");
      return res.status(404).json({ message: "Error deleting salary" });
    }

    return res.status(200).json({ message: "Student deleted Successfully" });
  } catch (error) {
    console.log("Internal sever error");
    return res.status(500).json({ message: "Internal server Error" });
  }
};

const updateStudent = async (req, res) => {
  const { id } = req.params;
  const { username, email, designation } = req.body;

  const student = await User.findByPk(id);
  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }
  student.username = username;
  student.email = email;
  student.designation = designation;
  await student.save();
  return res
    .status(200)
    .json({ message: "Student Deatils udated Sucessfully" });
};

const updateTeacher = async (req, res) => {
  const { id } = req.params;
  const { username, email, subject } = req.body;

  const teacher = await User.findByPk(id);
  if (!teacher) {
    return res.status(404).json({ message: "Teacher not found" });
  }

  teacher.username = username;
  teacher.email = email;
  teacher.subject = subject;

  await teacher.save();
  return res
    .status(200)
    .json({ message: "Teacher details updated successfully" });
};

const checkCsvFormat = (csvFile, expectedeaders) => {
  const fileBuffer = csvFile.buffer.toString();
  const lines = fileBuffer.split("\n");
  const headers = lines[0].split(",").map((header) => header.trim());
  console.log(headers, "header", expectedeaders, "expectedheader");

  return expectedeaders.every((header) => headers.includes(header));
};

module.exports = {
  addTeacher,
  getTeacher,
  addStudent,
  getStudent,
  deleteStudent,
  deleteTeacher,
  updateStudent,
  updateTeacher,
};
