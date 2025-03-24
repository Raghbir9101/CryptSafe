import { Router } from "express";
import TableController from "../controllers/table.controller";
const tableRouter = Router();
tableRouter.post("/", TableController.createTable);
tableRouter.route("/").get(TableController.getAllTableData).delete(TableController.deleteTable)
tableRouter.post("/insert/:tableID", TableController.insertRow);
tableRouter.patch("/update/:tableID/:rowID", TableController.updateRow);
tableRouter.delete("/delete/:tableID/:rowID", TableController.deleteRow);

export default tableRouter;
