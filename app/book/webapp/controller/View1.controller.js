sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (Controller, MessageToast, MessageBox) => {
    "use strict";

    return Controller.extend("book.controller.View1", {
        onInit: function () {
            this._oEditContext = null;

            setTimeout(() => {
                this._updateBookCount();
            }, 500);
        },
        onOpenDialog: function () {
            this._oEditContext = null;
            this.byId("addDialog").setTitle("Add Book");
            this.byId("addDialog").open();
        },

        onCloseDialog: function () {
            this.byId("addDialog").close();

            this.byId("titleInput").setValue("");
            this.byId("authorInput").setValue("");

            this._oEditContext = null;
        },

        onCreateBook: function () {
            var oModel = this.getView().getModel();

            var sTitle = this.byId("titleInput").getValue();
            var sAuthor = this.byId("authorInput").getValue();

            if (!sTitle || !sAuthor) {
                MessageToast.show("Please fill all fields ⚠️");
                return;
            }

            if (this._oEditContext) {

                this._oEditContext.setProperty("title", sTitle);
                this._oEditContext.setProperty("author", sAuthor);

                sap.m.MessageToast.show("Updated ✅");
                this._oEditContext = null;

            } else {

                var oData = {
                    title: sTitle,
                    author: sAuthor
                };

                var oBinding = oModel.bindList("/Books");
                oBinding.create(oData);

                sap.m.MessageToast.show("Book Added ✅");
            }

            this.byId("addDialog").close();
            this._updateBookCount();
        },

        onDelete: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();

            sap.m.MessageBox.confirm("Delete this book permanently?", {
                onClose: function (oAction) {
                    if (oAction === "OK") {
                        oContext.delete("$auto").then(function () {
                            sap.m.MessageToast.show("Deleted ✅");
                            this._updateBookCount();
                        }).catch(function () {
                            sap.m.MessageToast.show("Delete failed ❌");
                        });
                    }
                }

            });
        },
        onSearch: function (oEvent) {
            var sValue = oEvent.getParameter("newValue");

            var oList = this.byId("bookList");
            var oBinding = oList.getBinding("items");

            if (sValue) {
                var oFilter1 = new sap.ui.model.Filter(
                    "title",
                    sap.ui.model.FilterOperator.Contains,
                    sValue
                );

                var oFilter2 = new sap.ui.model.Filter(
                    "author",
                    sap.ui.model.FilterOperator.Contains,
                    sValue
                );

                var oFinalFilter = new sap.ui.model.Filter({
                    filters: [oFilter1, oFilter2],
                    and: false
                });

                oBinding.filter([oFinalFilter]);
            } else {
                oBinding.filter([]);
            }
            oList.getModel().refresh();
        },
        onEdit: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            this._oEditContext = oContext;

            var oData = oContext.getObject();

            this.byId("titleInput").setValue(oData.title);
            this.byId("authorInput").setValue(oData.author);

            this.byId("addDialog").setTitle("Edit Book");
            this.byId("addDialog").open();
        },
        _updateBookCount: function () {
            var oModel = this.getView().getModel();
            if (!oModel) return;

            oModel.bindList("/Books").requestContexts().then((aContexts) => {
                this.byId("totalText").setText(aContexts.length);
            });
        },
        onToggleFavorite: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();

            // get latest value properly
            var bFav = oContext.getObject().favorite;


            oContext.setProperty("favorite", !bFav);

            oContext.getModel().submitBatch("$auto").then(() => {

                sap.m.MessageToast.show(
                    bFav ? "Removed from Favorites ❌" : "Added to Favorites ⭐"
                );

            }).catch(() => {
                sap.m.MessageToast.show("Error ❌");
            });
        },
        formatHighlight: function (sText) {
    var sQuery = this._searchQuery;

    if (!sQuery) return sText;

    var regex = new RegExp(`(${sQuery})`, "gi");
    return sText.replace(regex, "<span style='background:yellow'>$1</span>");
}
        
        
    });
});