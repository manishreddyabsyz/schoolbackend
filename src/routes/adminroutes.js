const express=require("express");
const { csvFileUpload } = require("../middlewares/csvfileuploadmiddleware");
const { addTeacher, getTeacher,addStudent,getStudent, deleteStudent, deleteTeacher, updateStudent, updateTeacher } = require("../controllers/admincontrollers");
const router=express.Router();

router.post("/add-teacher", csvFileUpload.single("file"),addTeacher)
router.get("/get-teachers",getTeacher);
router.post("/add-students",csvFileUpload.single("file"),addStudent)
router.get("/get-students",getStudent)
router.delete("/delete-student/:id",deleteStudent)
router.delete("/delete-teacher/:id",deleteTeacher)
router.put("/update-student/:id",updateStudent);
router.put("/update-teacher/:id",updateTeacher)
module.exports=router;