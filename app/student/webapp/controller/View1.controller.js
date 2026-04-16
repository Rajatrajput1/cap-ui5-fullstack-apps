sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/viz/ui5/data/FlattenedDataset",
    "sap/viz/ui5/controls/common/feeds/FeedItem"
], (Controller, MessageToast, MessageBox, FlattenedDataset, FeedItem) => {
    "use strict";

    return Controller.extend("student.controller.View1", {
        onInit() {
            this._oEditContext = null;
        },
        onAfterRendering: function () {
            this._initChart(); // 
        },
        onOpenDialog: function () {
            this._oEditContext = null;
            this.byId("addDialog").open();

            this.byId("nameInput").setValue("");
            this.byId("ageInput").setValue("");
            this.byId("courseInput").setValue("");


        },

        onCloseDialog: function () {
            this.byId("addDialog").close();

            this.byId("nameInput").setValue("");
            this.byId("ageInput").setValue("");
            this.byId("courseInput").setValue("");

            this._oEditContext = null;

        },

        onCreateStudent: function () {

            var sName = this.byId("nameInput").getValue();
            var sAge = this.byId("ageInput").getValue();
            var sCourse = this.byId("courseInput").getValue();

            //  VALIDATION
            if (!sName || !sAge || !sCourse) {
                sap.m.MessageBox.error("All fields are required!");
                return;
            }

            if (isNaN(sAge)) {
                sap.m.MessageBox.error("Age must be a number!");
                return;
            }

            var oData = {
                name: sName,
                age: parseInt(sAge),
                course: sCourse
            };

            var oModel = this.getView().getModel();

            if (this._oEditContext) {
                this._oEditContext.setProperty("name", oData.name);
                this._oEditContext.setProperty("age", oData.age);
                this._oEditContext.setProperty("course", oData.course);

                sap.m.MessageToast.show("Updated ✅");
                this._oEditContext = null;

            } else {
                var oListBinding = oModel.bindList("/Students");
                oListBinding.create(oData);

                sap.m.MessageToast.show("Student Added ✅");
            }

            this.byId("addDialog").close();
        },
        onDelete: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var that = this;

            sap.m.MessageBox.confirm("Are you sure you want to delete?", {
                title: "Confirm",
                onClose: function (oAction) {
                    if (oAction === "OK") {
                        oContext.delete().then(function () {
                            sap.m.MessageToast.show("Deleted ✅");
                        });
                    }
                }
            });
        },
        onSearch: function (oEvent) {
            var sValue = oEvent.getParameter("newValue");

            var oTable = this.byId("studentTable");
            var oBinding = oTable.getBinding("items");

            if (sValue) {
                var oFilter = new sap.ui.model.Filter(
                    "name",
                    sap.ui.model.FilterOperator.Contains,
                    sValue
                );
                oBinding.filter([oFilter]);
            } else {
                oBinding.filter([]);
            }
        },
        onEdit: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var oData = oContext.getObject();

            this._oEditContext = oContext;

            this.byId("nameInput").setValue(oData.name);
            this.byId("ageInput").setValue(oData.age);
            this.byId("courseInput").setValue(oData.course);

            this.byId("addDialog").setTitle("Edit Student");
            this.byId("addDialog").open();
        },
        _initChart: function () {

            var oVizFrame = this.byId("idVizFrame");
            console.log("VizFrame:", oVizFrame);
            console.log("Model:", this.getView().getModel());

            // Dataset
            var oDataset = new FlattenedDataset({
                dimensions: [{
                    name: "Student",
                    value: "{name}"
                }],
                measures: [{
                    name: "Age",
                    value: "{age}"
                }],
                data: {
                    path: "/Students"
                }
            });

            oVizFrame.setDataset(oDataset);
            oVizFrame.setModel(this.getView().getModel());


            oVizFrame.addFeed(new FeedItem({
                uid: "valueAxis",
                type: "Measure",
                values: ["Age"]
            }));

            oVizFrame.addFeed(new FeedItem({
                uid: "categoryAxis",
                type: "Dimension",
                values: ["Student"]
            }));

            oVizFrame.setVizProperties({
                title: {
                    text: "Students by Age"
                }
            });
        },
        onApplyFilter: function () {

            var sName = this.byId("filterName").getValue();
            var sCourse = this.byId("filterCourse").getValue();

            var aFilters = [];

            if (sName) {
                aFilters.push(new sap.ui.model.Filter(
                    "name",
                    sap.ui.model.FilterOperator.Contains,
                    sName
                ));
            }

            if (sCourse) {
                aFilters.push(new sap.ui.model.Filter(
                    "course",
                    sap.ui.model.FilterOperator.Contains,
                    sCourse
                ));
            }

            var oTable = this.byId("studentTable");
            oTable.getBinding("items").filter(aFilters);
        },

        onClearFilter: function () {

            this.byId("filterName").setValue("");
            this.byId("filterCourse").setValue("");

            var oTable = this.byId("studentTable");
            oTable.getBinding("items").filter([]);
        }
    });
});