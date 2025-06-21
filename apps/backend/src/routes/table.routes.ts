import { Router } from "express";
import TableController, { upload } from "../controllers/table.controller";
const tableRouter = Router();
tableRouter.get("/:id", TableController.getTableDataWithID);
tableRouter.get("/rows/:id", TableController.getRows);
tableRouter.post("/", TableController.createTable);
tableRouter.patch("/:id", TableController.updateTable);
tableRouter.patch("/share/:id", TableController.shareTable);
tableRouter.route("/").get(TableController.getAllTableData)
tableRouter.post("/insert/:id", upload.any(), TableController.insertRow);
tableRouter.patch("/update/:id/:rowID", upload.any(), TableController.updateRow);
tableRouter.delete("/delete/:id/:rowID", TableController.deleteRow);
tableRouter.delete("/:id", TableController.deleteTable)

export default tableRouter;
