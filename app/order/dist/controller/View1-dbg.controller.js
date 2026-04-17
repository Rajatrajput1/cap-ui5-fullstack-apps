sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/viz/ui5/data/FlattenedDataset",
    "sap/viz/ui5/controls/common/feeds/FeedItem",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (Controller, FlattenedDataset, FeedItem, MessageToast, MessageBox) => {
    "use strict";

    return Controller.extend("order.controller.View1", {
        onInit: function () {

            this.getView().attachEventOnce("modelContextChange", () => {
                this._updateKPI();
                this._loadChart();

                var oModel = this.getView().getModel();

                if (!oModel) return;

                oModel.bindList("/Orders").requestContexts().then((aContexts) => {

                    var aData = aContexts.map(c => c.getObject());

                    // Total Orders
                    var total = aData.length;

                    // Total Revenue
                    var revenue = aData.reduce((sum, item) => sum + item.amount, 0);

                    // Delivered Orders
                    var delivered = aData.filter(item => item.status === "Delivered").length;

                    // Set values
                    this.byId("totalOrders").setText(total);
                    this.byId("totalRevenue").setText("₹ " + revenue);
                    this.byId("deliveredOrders").setText(delivered);

                });

            });


        },
        onFilterStatus: function (oEvent) {

            var sKey = oEvent.getParameter("selectedItem").getKey();

            var oTable = this.byId("ordersTable");
            var oBinding = oTable.getBinding("items");

            if (sKey) {
                var oFilter = new sap.ui.model.Filter(
                    "status",
                    sap.ui.model.FilterOperator.EQ,
                    sKey
                );
                oBinding.filter([oFilter]);
            } else {
                oBinding.filter([]);
            }


            this._updateKPI(sKey);
        },
        _updateKPI: function (statusFilter) {

            var oModel = this.getView().getModel();

            oModel.bindList("/Orders").requestContexts().then((aContexts) => {

                var aData = aContexts.map(c => c.getObject());

                // Apply filter if selected
                if (statusFilter) {
                    aData = aData.filter(item => item.status === statusFilter);
                }

                var total = aData.length;

                var revenue = aData.reduce((sum, item) => sum + item.amount, 0);

                var delivered = aData.filter(item => item.status === "Delivered").length;

                this.byId("totalOrders").setText(total);
                this.byId("totalRevenue").setText("₹ " + revenue);
                this.byId("deliveredOrders").setText(delivered);

            });
        },
        _loadChart: function () {

            var oModel = this.getView().getModel();

            oModel.bindList("/Orders").requestContexts().then((aContexts) => {

                var aData = aContexts.map(c => c.getObject());

                // Count by status
                var counts = {
                    Delivered: 0,
                    Pending: 0,
                    Cancelled: 0
                };

                aData.forEach(item => {
                    counts[item.status]++;
                });

                var chartData = [
                    { status: "Delivered", count: counts.Delivered },
                    { status: "Pending", count: counts.Pending },
                    { status: "Cancelled", count: counts.Cancelled }
                ];

                var oChartModel = new sap.ui.model.json.JSONModel(chartData);

                var oVizFrame = this.byId("idVizFrame");
                oVizFrame.setModel(oChartModel);

                oVizFrame.removeAllFeeds();

                var oDataset = new FlattenedDataset({
                    dimensions: [{
                        name: "Status",
                        value: "{status}"
                    }],
                    measures: [{
                        name: "Count",
                        value: "{count}"
                    }],
                    data: {
                        path: "/"
                    }
                });

                oVizFrame.setDataset(oDataset);

                oVizFrame.addFeed(new FeedItem({
                    uid: "categoryAxis",
                    type: "Dimension",
                    values: ["Status"]
                }));

                oVizFrame.addFeed(new FeedItem({
                    uid: "valueAxis",
                    type: "Measure",
                    values: ["Count"]
                }));

            });
        },
        onOpenDialog: function () {
            this.byId("addDialog").open();
        },

        onCloseDialog: function () {
            this.byId("addDialog").close();
        },

        onCreateOrder: function () {

            var oModel = this.getView().getModel();

            var oData = {
                customer: this.byId("customerInput").getValue(),
                amount: parseFloat(this.byId("amountInput").getValue()),
                status: this.byId("statusInput").getSelectedKey()
            };

            var oBinding = oModel.bindList("/Orders");
            oBinding.create(oData);

            sap.m.MessageToast.show("Order created successfully");

            this.byId("addDialog").close();
            this._updateKPI();
            this._loadChart();


        },
        onDelete: function (oEvent) {

            var oContext = oEvent.getSource().getBindingContext();

            sap.m.MessageBox.confirm("Delete this order?", {
                onClose: (oAction) => {

                    if (oAction === "OK") {

                        oContext.delete().then(() => {
                            sap.m.MessageToast.show("Deleted successfully");
                            this._updateKPI();
                            this._loadChart();



                        });

                    }

                }
            });
        }
    });
});