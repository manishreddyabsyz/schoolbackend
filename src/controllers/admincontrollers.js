const fs = require("fs");
const csv = require("csv-parser");
const bcrypt = require("bcrypt");
const User = require("../../models").Users;
const nodemailer = require("nodemailer");
const { log } = require("console");

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
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body, html {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            font-size: 16px;
          }
          .container {
            margin: 0 auto;
            background-color: #f4f4f4;
            border-radius: 5px;
            overflow: hidden;
            background-image: url("https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDI0LTAyL3Jhd3BpeGVsX29mZmljZV80Nl9jdXRlX3NpbXBsaWZpZWRfd2VkZGluZ19jYXJkX2dyYWRpZW50X2JhY2tncl80NWZmNjY3OS0zYTQxLTQyY2EtODM1MC05MGYwYWU1YzkxNzguanBn.jpg");
            background-size: cover;
            background-repeat: no-repeat;
            height: 100%;
          }
          .content {
            max-width: 600px;
            padding: 20px;
            border-radius: 5px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
          }
        </style>
      </head>
      <body>
        <table cellpadding="0" cellspacing="0" border="0" align="center" width="100%" style="border-collapse: collapse;">
          <tr>
            <td>
              <table cellpadding="0" cellspacing="0" border="0" align="center" width="100%">
                <tr>
                  <td class="container">
                    <table cellpadding="0" cellspacing="0" border="0" align="center" width="100%">
                      <tr>
                        <td class="content">
                          <div class="header">
                            <h1>You're Invited to ${"kapil" +"'s "+ "Marriage Anivsesary"}!</h1>
                          </div>
                          <div class="body">
                            <p>Hi [Recipient's Name],</p>
                            <p>You are cordially invited to join us for ${"Marriage Anniversary"} on ${"09-03-2024"}at ${"Hyderabad"}.</p>
                            <p>Details:</p>
                            <ul>
                              <li><strong>Event:</strong> </li>
                              <li><strong>Date:</strong></li>
                              <li><strong>Time:</strong> </li>
                              <li><strong>Location:</strong></li>
                            </ul>
                            <p>Please RSVP by [RSVP Deadline] using the button below:</p>
                            <p><a class="button" href="[RSVP Link]">RSVP Now</a></p>
                            <p>We hope you can join us for this special event. Feel free to contact us at if you have any questions.</p>
                            <p>Best regards,<b>}</p>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
      
          `,
    });
    console.log("Message sent :%s", info.messageId);
  } catch (error) {
    console.log("Error occured while sending Email", error);
  }
};

const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};
const addTeacher = async (req, res) => {
  const csvFile = req.file;

  if (!csvFile) {
    return res.status(400).json({ message: "Please upload CSV file " });
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
   
   teachers.map((arr)=>{
    if (!(validateEmail(arr.email))){
      return res.status(400).json({message:"Invalid Email Format"})
    }
   })


    await User.bulkCreate(teachers);
    return res.status(200).json({ message: "Teachers added successfully" });
  } catch (error) {
    console.error("Internal server error", error);
    return res.status(500).json({ message: "Internal server error" });
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
    return res.status(400).json({ message: "No CSV file is uploaded" });
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
    students.map((arr)=>{
      if (!(validateEmail(arr.email))){
        return res.status(400).json({message:"Invalid Email Format"})
      }
     })
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

const getAdminDetails=async(req,res)=>{
    try{
      const admin= await User.findOne({where : {role:"Admin"}});
      const {firstname,lastname,email,dob,phonenumber,role,designation,subject}=admin;
      const details={firstname,lastname,email,dob,phonenumber,role,designation,subject}
      res.status(200).json({data:details})

    }catch(error){
      console.log("Error retreving admin profile details",error);
      res.status(500).json({message:"Internal server error"})
    }
}

const updateAdminDetails=async(req,res)=>{
  const {firstname,lastname,dob,phonenumber}=req.body;
  const {id}=req.params;
  const adminInfo=await User.findOne({where : {id}});
  if(!adminInfo){
    return res.status(200).json({message:"User not found"})
  }
  adminInfo.firstname=firstname,
  adminInfo.lastname=lastname,
  adminInfo.dob=dob,
  adminInfo.phonenumber=phonenumber 

  await adminInfo.save();
  return res.status(200).json({message:"Admin details updated successfully"})

}


const getTeacherDetails=async(req,res)=>{

  const {id}=req.params;
  const teacherDetails=await User.findOne({where :{id}});
  if(!teacherDetails){
    return res.status(200).json({message:`Teacher not found by ${id}`})
  }
  try{
    const {firstname,lastname,email,dob,phonenumber,role,designation,subject}=teacherDetails;
    const details={firstname,lastname,email,dob,phonenumber,role,designation,subject}
    return res.status(200).json({data:details})

  }catch(error){
    console.log("Error retreving teacher profile details",error);
    return res.status(500).json({message:"Internal server error"})
  }

}

const updateTeacherDetails=async(req,res)=>{
  const {id}=req.params;
  const{firstname,lastname,dob,phonenumber}=req.body;
  try{
    const teacher=await User.findOne({where :{id}});
    if(!teacher){
      return res.status(404).json({message:`Teacher not found by ${id}`})
    }
    teacher.firstname=firstname;
    teacher.lastname=lastname;
    teacher.dob=dob;
    teacher.phonenumber=phonenumber;

    await teacher.save();
    return res.status(200).json({message:"Teacher details updated successfully"})

  }catch(error){
    console.log("Error updating teacher profile details",error);
    return res.status(500).json({message:"Internal server error"})
  }
}

const getStudentDetails=async(req,res)=>{

  const {id}=req.params;
  const studentDetails=await User.findOne({where :{id}});
  if(!studentDetails){
    return res.status(200).json({message:`Student not found by ${id}`})
  }
  try{
    const {firstname,lastname,email,dob,phonenumber,role,designation,subject}=studentDetails;
    const details={firstname,lastname,email,dob,phonenumber,role,designation,subject}
    return res.status(200).json({data:details})

  }catch(error){
    console.log("Error retreving student profile details",error);
    return res.status(500).json({message:"Internal server error"})
  }

}

const updateStudentDetails=async(req,res)=>{
  const {id}=req.params;
  const{firstname,lastname,dob,phonenumber}=req.body;
  try{
    const student=await User.findOne({where :{id}});
    if(!student){
      return res.status(404).json({message:`Student not found by ${id}`})
    }
    student.firstname=firstname;
    student.lastname=lastname;
    student.dob=dob;
    student.phonenumber=phonenumber;

    await student.save();
    return res.status(200).json({message:"Student details updated successfully"})

  }catch(error){
    console.log("Error student teacher profile details",error);
    return res.status(500).json({message:"Internal server error"})
  }
}

module.exports = {
  addTeacher,
  getTeacher,
  addStudent,
  getStudent,
  deleteStudent,
  deleteTeacher,
  updateStudent,
  updateTeacher,
  getAdminDetails,
  updateAdminDetails,
  getTeacherDetails,
  updateTeacherDetails,
  getStudentDetails,
  updateStudentDetails
};
