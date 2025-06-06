import { Router } from "express";
import AdminController from "../controllers/admin.controller";

const router = Router();

router.get("/getUsers", AdminController.getUsersByAdmin);

router.post("/createUserByAdmin",AdminController.createUser)

export default router;