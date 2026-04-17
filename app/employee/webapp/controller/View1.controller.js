sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, MessageToast, MessageBox, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("employee.controller.View1", {
        oEditContext: null,
        onInit: function () {

        },
        onAfterRendering: function () {
            this.updateKPI();
        },

        onOpenDialog: function () {
            this.byId("addDialog").open();
        },

        onCloseDialog: function () {
            this.byId("addDialog").close();

            this.byId("nameInput").setValue("");
            this.byId("deptInput").setValue("");
            this.byId("salaryInput").setValue("");
            this.byId("statusInput").setSelectedKey("");

            this.oEditContext = null;
        },

        onCreateEmployee: function () {

            var oModel = this.getView().getModel();

            var oData = {
                name: this.byId("nameInput").getValue(),
                department: this.byId("deptInput").getValue(),
                salary: parseFloat(this.byId("salaryInput").getValue()),
                status: this.byId("statusInput").getSelectedKey()
            };


            if (this.oEditContext) {

                this.oEditContext.setProperty("name", oData.name);
                this.oEditContext.setProperty("department", oData.department);
                this.oEditContext.setProperty("salary", oData.salary);
                this.oEditContext.setProperty("status", oData.status);

                MessageToast.show("Employee updated");
                this.oEditContext = null;

                this.byId("addDialog").close();
                this.updateKPI();
                return;
            }


            var oBinding = oModel.bindList("/Employees");

            oBinding.create(oData).created().then(() => {
                MessageToast.show("Employee added");
                this.byId("addDialog").close();
                this.updateKPI();
            });
        },

        onDelete: function (oEvent) {

            var oContext = oEvent.getSource().getBindingContext();

            MessageBox.confirm("Delete employee?", {
                onClose: (oAction) => {
                    if (oAction === "OK") {
                        oContext.delete().then(() => {
                            MessageToast.show("Deleted");
                            this.updateKPI();
                        });
                    }
                }
            });
        },

        onFilterDepartment: function (oEvent) {

            var sKey = oEvent.getSource().getSelectedKey();

            var oTable = this.byId("empTable");
            var oBinding = oTable.getBinding("items");

            if (sKey) {
                var oFilter = new Filter("department", FilterOperator.EQ, sKey);
                oBinding.filter([oFilter]);
            } else {
                oBinding.filter([]);
            }
        },
        updateKPI: async function () {
            try {
                const oModel = this.getView().getModel();
                const oBinding = oModel.bindList("/Employees");

                const aContexts = await oBinding.requestContexts(0, 100);
                const data = aContexts.map(ctx => ctx.getObject());

                const total = data.length;
                const active = data.filter(e => e.status === "Active").length;
                const avgSalary = total
                    ? data.reduce((sum, e) => sum + e.salary, 0) / total
                    : 0;

                const oJSON = new sap.ui.model.json.JSONModel({
                    totalEmployees: total,
                    activeEmployees: active,
                    avgSalary: avgSalary.toFixed(0)
                });

                this.getView().setModel(oJSON, "kpi");

            } catch (err) {
                console.error("KPI Error:", err);
            }
        },
        onEdit: function (oEvent) {
            const oContext = oEvent.getSource().getBindingContext();
            const data = oContext.getObject();

            this.oEditContext = oContext;

            this.byId("nameInput").setValue(data.name);
            this.byId("deptInput").setValue(data.department);
            this.byId("salaryInput").setValue(data.salary);
            this.byId("statusInput").setSelectedKey(data.status);

            this.byId("addDialog").setTitle("Edit Employee");
            this.byId("addDialog").open();
        },
        onSearch: function (oEvent) {
            const sQuery = oEvent.getParameter("newValue");

            const oTable = this.byId("empTable");
            const oBinding = oTable.getBinding("items");

            if (!sQuery) {
                oBinding.filter([]);
                return;
            }

            const aFilters = [
                new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, sQuery),
                new sap.ui.model.Filter("department", sap.ui.model.FilterOperator.Contains, sQuery)
            ];

            const oFilter = new sap.ui.model.Filter({
                filters: aFilters,
                and: false
            });

            oBinding.filter(oFilter);
        },
        onTabSelect: function (oEvent) {
            const sKey = oEvent.getParameter("key");

            const oTable = this.byId("empTable");
            const oBinding = oTable.getBinding("items");

            if (sKey === "all") {
                oBinding.filter([]);
                return;
            }

            const oFilter = new sap.ui.model.Filter(
                "status",
                sap.ui.model.FilterOperator.EQ,
                sKey
            );

            oBinding.filter([oFilter]);
        }

    });
});