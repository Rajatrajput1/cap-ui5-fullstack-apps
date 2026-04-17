sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (Controller, JSONModel, MessageToast, Filter, FilterOperator) => {
    "use strict";

    return Controller.extend("feedback.controller.View1", {

        onInit() {
            this.byId("feedbackTable").attachEventOnce("updateFinished", () => {
                this.updateKPI();
            });
        },

        // KPI LOGIC
        async updateKPI() {
            const oModel = this.getView().getModel();
            const oBinding = oModel.bindList("/Feedback");

            const aContexts = await oBinding.requestContexts(0, 100);
            const data = aContexts.map(ctx => ctx.getObject());

            const total = data.length;

            const avgRating = total
                ? (data.reduce((sum, f) => sum + f.rating, 0) / total).toFixed(1)
                : 0;

            const negative = data.filter(f => f.rating <= 2).length;

            this.getView().setModel(new JSONModel({
                total,
                avgRating,
                negative
            }), "kpi");

            const ratingMap = {};

            data.forEach(f => {
                const r = f.rating;
                ratingMap[r] = (ratingMap[r] || 0) + 1;
            });

            const chartData = Object.keys(ratingMap).map(key => ({
                rating: key,
                count: ratingMap[key]
            }));

            this.getView().setModel(new sap.ui.model.json.JSONModel({
                data: chartData
            }), "chart");

            const categoryMap = {};

            data.forEach(f => {
                const c = f.category;
                categoryMap[c] = (categoryMap[c] || 0) + 1;
            });

            const categoryData = Object.keys(categoryMap).map(key => ({
                category: key,
                count: categoryMap[key]
            }));

            // SET MODEL
            this.getView().setModel(new JSONModel({
                data: categoryData
            }), "categoryChart");
        },

        //SEARCH
        onSearch(oEvent) {
            const query = oEvent.getParameter("newValue");

            const oBinding = this.byId("feedbackTable").getBinding("items");

            if (!query) {
                oBinding.filter([]);
                return;
            }

            const filters = [
                new Filter("customer", FilterOperator.Contains, query),
                new Filter("comment", FilterOperator.Contains, query),
                new Filter("category", FilterOperator.Contains, query)
            ];

            oBinding.filter(new Filter({
                filters,
                and: false
            }));
        },
        //OPEN DIALOG
        onOpenDialog() {
            this.byId("feedbackDialog").open();
        },

        // CLOSE DIALOG
        onCloseDialog() {
            this.byId("feedbackDialog").close();

            this.byId("customerInput").setValue("");
            this.byId("commentInput").setValue("");


            this.byId("ratingInput").setSelectedKey("3");
            this.byId("categoryInput").setSelectedKey("Product");
        },

        // SAVE FEEDBACK
        onSaveFeedback() {

    const customer = this.byId("customerInput").getValue();
    const comment = this.byId("commentInput").getValue();

    const ratingKey = this.byId("ratingInput").getSelectedKey() || "3";
    const category = this.byId("categoryInput").getSelectedKey() || "Product";

    if (!customer || !comment) {
        MessageToast.show("Please fill all fields");
        return;
    }

    const oData = {
        customer,
        comment,
        rating: Number(ratingKey),
        category,
        date: new Date().toISOString().split("T")[0]
    };

    const oModel = this.getView().getModel();
    const oBinding = oModel.bindList("/Feedback");

    const oContext = oBinding.create(oData);

    oContext.created()
        .then(() => oModel.submitBatch("$auto")) 
        .then(() => {
            MessageToast.show("Feedback added");
            this.onCloseDialog();
            this.updateKPI();
        })
        .catch(err => {
            console.error("Create Error:", err);
            MessageToast.show("Error saving feedback");
        });
}
    });
});