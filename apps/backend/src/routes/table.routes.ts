import { Router } from "express";
import TableController from "../controllers/table.controller";
const tableRouter = Router();
tableRouter.post("/", TableController.createTable);
tableRouter.route("/").get(TableController.getAllTableData).delete(TableController.deleteTable)

export default tableRouter;
