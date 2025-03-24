import { Router } from "express";
import UserController from "../controllers/user.controller";

const router = Router();

router.get("/getUser", UserController.getUserDataWithToken);

router.delete("/:id", UserController.deleteUser);

export default router;
