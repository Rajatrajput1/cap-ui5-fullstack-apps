sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (Controller, JSONModel, Filter, FilterOperator, MessageToast, MessageBox) => {
    "use strict";

    return Controller.extend("product.controller.View1", {

        oEditContext: null,

        onInit() {
            // Ensure KPI + chart loads after table data
            this.byId("prodTable").attachEventOnce("updateFinished", () => {
                this.updateKPI();
            });
        },

        //  KPI + CHART LOGIC
        async updateKPI() {
            try {
                const oModel = this.getView().getModel();
                const oBinding = oModel.bindList("/Products");

                const aContexts = await oBinding.requestContexts(0, 100);
                const data = aContexts.map(ctx => ctx.getObject());

                // KPI
                const total = data.length;
                const lowStock = data.filter(p => p.stock < 5).length;

                // Inventory Value
                const totalValue = data.reduce((sum, p) => {
                    return sum + (p.price * p.stock);
                }, 0);

                // Chart Data (Category Count)
                const categoryMap = {};

                data.forEach(p => {
                    if (!categoryMap[p.category]) {
                        categoryMap[p.category] = 0;
                    }
                    categoryMap[p.category]++;
                });

                const chartData = Object.keys(categoryMap).map(key => ({
                    category: key,
                    count: categoryMap[key]
                }));

                // KPI Model
                this.getView().setModel(new JSONModel({
                    totalProducts: total,
                    lowStock: lowStock,
                    totalValue: totalValue.toFixed(0)
                }), "kpi");

                // Chart Model
                this.getView().setModel(new JSONModel({
                    data: chartData
                }), "chart");

            } catch (err) {
                console.error("KPI Error:", err);
            }
        },

        // SEARCH
        onSearch(oEvent) {
            const sQuery = oEvent.getParameter("newValue");
            const oBinding = this.byId("prodTable").getBinding("items");

            if (!sQuery) {
                oBinding.filter([]);
                return;
            }

            const aFilters = [
                new Filter("name", FilterOperator.Contains, sQuery),
                new Filter("category", FilterOperator.Contains, sQuery)
            ];

            oBinding.filter(new Filter({
                filters: aFilters,
                and: false
            }));
        },

        // TAB FILTER
        onTabSelect(oEvent) {
            const key = oEvent.getParameter("key");
            const oBinding = this.byId("prodTable").getBinding("items");

            if (key === "low") {
                oBinding.filter([
                    new Filter("stock", FilterOperator.LT, 5)
                ]);
            } else {
                oBinding.filter([]);
            }
        },

        // CATEGORY FILTER
        onFilterCategory(oEvent) {
            const sKey = oEvent.getSource().getSelectedKey();
            const oBinding = this.byId("prodTable").getBinding("items");

            if (!sKey) {
                oBinding.filter([]);
                return;
            }

            oBinding.filter([
                new Filter("category", FilterOperator.EQ, sKey)
            ]);
        },

        // ➕ OPEN DIALOG
        onOpenDialog() {
            this.byId("productDialog").setTitle("Add Product");
            this.byId("productDialog").open();
        },

        // CLOSE DIALOG
        onCloseDialog() {
            this.byId("productDialog").close();

            this.byId("nameInput").setValue("");
            this.byId("categoryInput").setValue("");
            this.byId("priceInput").setValue("");
            this.byId("stockInput").setValue("");

            this.oEditContext = null;
        },

        // CREATE + UPDATE
        onSaveProduct() {

            const oModel = this.getView().getModel();

            const oData = {
                name: this.byId("nameInput").getValue(),
                category: this.byId("categoryInput").getValue(),
                price: parseFloat(this.byId("priceInput").getValue()),
                stock: parseInt(this.byId("stockInput").getValue())
            };

            // Validation
            if (!oData.name || !oData.category) {
                MessageToast.show("Fill all fields");
                return;
            }

            // UPDATE
            if (this.oEditContext) {

                this.oEditContext.setProperty("name", oData.name);
                this.oEditContext.setProperty("category", oData.category);
                this.oEditContext.setProperty("price", oData.price);
                this.oEditContext.setProperty("stock", oData.stock);

                MessageToast.show("Product updated");

                this.oEditContext = null;
                this.byId("productDialog").close();
                this.updateKPI();
                return;
            }

            // ➕ CREATE
            const oBinding = oModel.bindList("/Products");

            oBinding.create(oData).created().then(() => {
                MessageToast.show("Product added");
                this.byId("productDialog").close();
                this.updateKPI();
            });
        },

        // EDIT
        onEdit(oEvent) {

            const oContext = oEvent.getSource().getBindingContext();
            const data = oContext.getObject();

            this.oEditContext = oContext;

            this.byId("nameInput").setValue(data.name);
            this.byId("categoryInput").setValue(data.category);
            this.byId("priceInput").setValue(data.price);
            this.byId("stockInput").setValue(data.stock);

            this.byId("productDialog").setTitle("Edit Product");
            this.byId("productDialog").open();
        },

        // DELETE
        onDelete(oEvent) {

            const oContext = oEvent.getSource().getBindingContext();

            MessageBox.confirm("Delete product?", {
                onClose: (oAction) => {
                    if (oAction === "OK") {
                        oContext.delete().then(() => {
                            MessageToast.show("Deleted");
                            this.updateKPI();
                        });
                    }
                }
            });
        }

    });
});