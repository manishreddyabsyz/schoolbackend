const express=require("express");
const { csvFileUpload } = require("../middlewares/csvfileuploadmiddleware");
const { addTeacher, getTeacher,addStudent,getStudent, deleteStudent, deleteTeacher, updateStudent, updateTeacher, getAdminDetails, updateAdminDetails, getTeacherDetails, updateTeacherDetails, getStudentDetails, updateStudentDetails } = require("../controllers/admincontrollers");
const router=express.Router();

router.post("/add-teachers", csvFileUpload.single("file"),addTeacher)
router.get("/get-teachers",getTeacher);
router.post("/add-students",csvFileUpload.single("file"),addStudent)
router.get("/get-students",getStudent)
router.delete("/delete-student/:id",deleteStudent)
router.delete("/delete-teacher/:id",deleteTeacher)
router.put("/update-student/:id",updateStudent);
router.put("/update-teacher/:id",updateTeacher)
router.get("/admin-profile-details",getAdminDetails)
router.put("/update-admin-details/:id",updateAdminDetails)
router.get("/teacher-profile-details/:id",getTeacherDetails)
router.put("/update-teacher-profile-details/:id",updateTeacherDetails)
router.get("/student-profile-details/:id",getStudentDetails);
router.put("/update-student-profile-details/:id",updateStudentDetails);
module.exports=router;