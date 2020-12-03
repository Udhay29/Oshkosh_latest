import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild, ChangeDetectorRef } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { forkJoin } from "rxjs/observable/forkJoin";
import { CoreServices } from "../../../../core/services/core.service";
import { SharedService } from "../../../../shared/services/share.service";
import * as constants from "../rack-builder-constants";
import { RackBuilderService } from "../rack-builder.service";
import { Dialog } from "primeng/dialog";
import { ModalService } from "src/app/core/services/modal.service";
import { PouSingleRackService } from "../../pou-single-rack.service";
import { rackBuilderKey } from '../../constants';

@Component({
    selector: "pfep-rack-builder",
    templateUrl: "./rack-builder.component.html",
    styleUrls: ["./rack-builder.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class RackBuilderComponent implements OnInit, OnDestroy {
    isEditable = false;
    searchFields: Array<any> = constants.searchFields;
    searchCriteria = {
        [constants.branch]: ""
    };
    emptySearchFields = [];
    detailsAvailable = false;
    rackDetails: any = {};
    rackFields: any = [];
    rackTypes = constants.rackTypes;
    rackTypesKey = constants.rackTypesKey;
    rackTypeddKey = constants.rackType;
    fieldsMap = constants.fieldsMap;
    segments = constants.segments;
    masterKitId = constants.masterKitId;
    nonMandatoryFields = constants.nonMandatoryFields;
    invalidFields = [];
    currentRackType: string = constants.shelfTypeKey;
    selectedSegments: Array<string> = [];
    assignmentTableFields = constants.assignmentTableFields;
    assignmentTableData = [];
    branchDescKey = constants.branchDescKey;
    branch = constants.branch;
    selectedRows = {};
    selectAllChkBxStatus = false;
    rackTypeChangeCnfrmtn = false;
    newRacktype = "";
    hasEdits = false;
    enabledSegments = [];
    rackValues = {};
    dropDownvalues = {
        [constants.rackTypesKey]: [],
        [constants.UOM]: [],
        [constants.rollers]: []
    };
    uomConversion = 1;
    isNew = false;
    showForm = false;
    Object: Object = Object
    routeDeactivated: boolean = false;

    @ViewChild(Dialog) dialog: Dialog;

    constructor(
        public rackBuilderService: RackBuilderService,
        public fb: FormBuilder,
        public sharedService: SharedService,
        public coreService: CoreServices,
        private route: ActivatedRoute,
        public modalService: ModalService,
        public pouSingleRackService: PouSingleRackService,
        public changeDetectorRef: ChangeDetectorRef
    ) { }

    ngOnInit() {
        const routeRoles = this.route.snapshot.data.roles;
        this.rackBuilderService.setEditAccess(
            this.coreService.checkAccess(routeRoles)
        );
        this.isEditable = this.rackBuilderService.getEditAccess();
        this.selectedSegments.push(
            JSON.parse(localStorage.getItem("currentUser")).org_id
        );
        forkJoin([
            this.rackBuilderService.getRackTypeDDValues(),
            this.rackBuilderService.getUOMDDValues(),
            this.rackBuilderService.getRollersDDValues()
        ]).subscribe(responses => {
            this.parseDDValues(
                constants.rackType,
                constants.rackTypesKey,
                responses[0]
            );
            this.parseDDValues(constants.UOM, constants.UOM, responses[1]);
            this.parseDDValues(
                constants.rollerDDkey,
                constants.rollers,
                responses[2]
            );
            // this.buildRackTypeForm();
        });

        this.modalService.getConfirmationSubject().subscribe(navigateAway => {
            if (!navigateAway && this.routeDeactivated) {
                this.routeDeactivated = false;
                this.pouSingleRackService.getTabClickSub().next(rackBuilderKey);
            }
        })
    }

    parseDDValues = (key, ddObjVariable, values) => {
        if (values) {
            this.dropDownvalues[ddObjVariable] = [
                ...values.map(val => ({
                    [key]: val["DROP_DOWN_VALUE"],
                    IsSelected: false
                }))
            ];
        } else {
            this.dropDownvalues[ddObjVariable] = null;
        }
    };

    searchClicked = () => {
        this.emptySearchFields = [];
        /* for (const field in this.searchCriteria) {
            if (this.isEmpty(this.searchCriteria[field])) {
                this.emptySearchFields.push(field);
            }
        } */
        if (this.isEmpty(this.searchCriteria[constants.masterKitId])) {
            this.emptySearchFields.push(constants.masterKitId);
        }

        if (this.emptySearchFields.length === 0) {
            this.coreService.showLoader();
            this.rackBuilderService
                .getRackDetails(this.searchCriteria)
                .subscribe(res => {
                    if (res["StatusType"] === "SUCCESS" || res["StatusType"] === "INFO") {
                        this.setRackDetails(res[constants.rackDetailsAPIKey]);
                        this.setRacksTableData(res[constants.racksTableAPIKey]);
                        this.setSegments(res[constants.segmentsListAPIKey]);
                        this.detailsAvailable = true;
                        this.showForm = true;
                        this.confirmValues();
                        if (res["StatusType"] === "INFO") {
                            this.rackBuilderService.displayMessage(
                                "info",
                                "Master rack id is not assigned to any segment/branch"
                            );
                        }
                    } else {
                        this.rackBuilderService.displayMessage(
                            "error",
                            "Unable to fetch data. Please try again."
                        );
                    }

                    this.coreService.hideLoader();
                });
        }
    };

    wildCardChangeEvent = (e, key) => {
        if (key === constants.masterKitId) {
            if (typeof e.selectedData === 'string') {
                this.searchCriteria[constants.masterKitId] = e.selectedData;
                return;
            }
            this.searchCriteria[constants.masterKitId] = e.selectedData[constants.masterKitId];
            this.searchCriteria[constants.branch] = e.selectedData[constants.branch];
        } else {
            this.searchCriteria[key] = e.selectedData;
        }
        if (key === constants.branch) {
            this.searchFields[1].config.dependentData = {
                [constants.branch]: e.selectedData
            };
            this.searchFields[1].config = { ...this.searchFields[1].config };
            this.searchFields = [...this.searchFields];
        }
    };

    isEmpty = value => ["", null, undefined, 'null'].indexOf(value) > -1;

    createNewRack = () => {
        this.isNew = true;
        this.detailsAvailable = false;
        this.showForm = false;
        this.assignmentTableData = [];
        this.invalidFields = [];
        this.selectedRows = {};
        this.rackValues = {};
        this.selectedSegments = [];
        this.resetDDValues();
        this.rackDetails.reset();
    };

    newRackTypeChange = e => {
        this.showForm = true;
        this.currentRackType = e.target.value;
        this.hasEdits = true;
        this.buildRackTypeForm(true);
    };

    resetDDValues = () => {
        for (const dd in constants.dropDowns) {
            this.changeSelectedDDValue(dd, "", constants.dropDowns[dd]);
        }
    };

    buildRackTypeForm = (newClicked?) => {
        let kitId = "";
        if (
            !newClicked &&
            this.rackDetails.controls &&
            this.rackDetails.controls[constants.masterKitId] &&
            !this.isEmpty(
                this.rackDetails.controls[constants.masterKitId].value
            )
        ) {
            kitId = this.rackDetails.controls[constants.masterKitId].value;
        }
        const rackFields = this.getRackTypeBasedFields();
        this.rackDetails = this.fb.group(rackFields);

        if (newClicked) {
            this.changeSelectedDDValue(
                constants.rackTypesKey,
                this.currentRackType,
                constants.rackType
            );
        }

        this.invalidFields = [];
        if (!this.isEmpty(kitId) && !newClicked) {
            this.rackDetails.controls[constants.masterKitId].setValue(kitId);
        }
    };

    setRackDetails = rackDetails => {
        this.currentRackType = this.getDDValue(
            rackDetails[constants.rackTypesKey],
            constants.dropDowns[constants.rackTypesKey]
        );
        this.buildRackTypeForm();
        constants.fieldsMap[this.currentRackType].forEach(item => {
            this.rackDetails.controls[item.field].setValue(
                rackDetails[item.field]
            );
            if (constants.dropDowns[item.field]) {
                this.dropDownvalues[item.field] = rackDetails[item.field]
                    ? [...rackDetails[item.field]]
                    : null;

                this.rackDetails.controls[item.field].setValue(this.getDDValue(rackDetails[item.field], constants.dropDowns[item.field]));
            }
            if (constants.keyFieldsToDisable.indexOf(item.field) > -1) {
                this.rackDetails.controls[item.field].disable();
            }
            if (item.field === constants.UOM) {
                this.uomConversion = constants.uomConversionMap[this.getDDValue(rackDetails[item.field], constants.dropDowns[constants.UOM])];
            }

            if (item.field === constants.rollers) {
                const rollersValue = this.getDDValue(
                    rackDetails[item.field],
                    constants.dropDowns[constants.rollers]
                );
                if (rollersValue && rollersValue.toUpperCase() === "NO") {
                    this.rackDetails.controls[
                        constants.rollersPerShelf
                    ].disable();
                    this.rackDetails.controls[constants.rollerHeight].disable();
                }
            }
        });
    };

    setRacksTableData = tableData => {
        this.assignmentTableData = [...tableData];
        this.setSelectedRows();
    };

    setSegments = segments => {
        this.segments = [...segments].map(segment => segment["ORG_ID"]);
        this.selectedSegments = segments.reduce((acc, segment) => {
            return segment.IsSelected ? [...acc, segment["ORG_ID"]] : acc;
        }, []);
        this.enabledSegments = segments.map(segment => segment["ORG_ID"]);
    };

    segmentChkbxChange = (checked, segment) => {
        this.hasEdits = true;
        const postData = {
            [constants.masterKitId]: this.rackDetails.controls[
                constants.masterKitId
            ].value,
            SEGMENTS: this.selectedSegments
        };
        this.coreService.showLoader();
        this.rackBuilderService
            .getAssignmentTblDetails(postData)
            .subscribe(tblData => {
                this.assignmentTableData = tblData[constants.racksTableAPIKey]
                    ? tblData[constants.racksTableAPIKey]
                    : [];
                this.setSelectedRows();
                this.coreService.hideLoader();
            });
    };

    getRackTypeBasedFields = () => {
        const rackFields = {};
        constants.fieldsMap[this.currentRackType].map(attr => {
            rackFields[attr.field] = [null];
        });
        return rackFields;
    };

    ddValueChange = (value, field, ddKey) => {
        if (value !== "null") {
            this.hasEdits = true;
        }
        if (field === constants.rackTypesKey) {
            if (!this.checkIfFieldsAreEmpty()) {
                this.newRacktype = value;
                this.rackTypeChangeCnfrmtn = true;
                return;
            }
            this.currentRackType = value;
            this.resetDDValues();
            const kitId = this.rackDetails.controls[constants.masterKitId].value;
            this.buildRackTypeForm(true);
            this.rackDetails.controls[constants.masterKitId].setValue(kitId);
            this.disableKeyFields(this.isNew);
        }

        this.changeSelectedDDValue(field, value, constants.dropDowns[field]);

        if (field === constants.UOM) {
            this.uomConversion = constants.uomConversionMap[value];
        }

        if (field === constants.rollers) {
            if (value && value.toUpperCase() === "NO") {
                [constants.rollersPerShelf, constants.rollerHeight].forEach(
                    field => {
                        const idx = this.invalidFields.indexOf(field);
                        if (idx > -1) {
                            this.invalidFields.splice(idx, 1);
                        }
                        this.rackDetails.controls[field].disable();
                        this.rackDetails.controls[field].setValue(null);
                    }
                );
            } else {
                this.rackDetails.controls[constants.rollersPerShelf].enable();
                this.rackDetails.controls[constants.rollerHeight].enable();
            }
        }

        this.isFieldInvalid(field);
    };

    disableKeyFields = isNew => {
        if (!isNew) {
            constants.keyFieldsToDisable.forEach(field => {
                this.rackDetails.controls[field].disable();
            })
        }
    }

    changeSelectedDDValue = (field, value, ddKey) => {
        const ddvalues = this.dropDownvalues[field];

        ddvalues.forEach(opt => {
            opt.IsSelected = false;
            if (opt[ddKey] === value.trim()) {
                opt.IsSelected = true;
            }
        });

        if (this.rackDetails.controls[field]) {
            this.rackDetails.controls[field].setValue(value);
        }
        this.dropDownvalues[field] = [...ddvalues];
        this.dropDownvalues = { ... this.dropDownvalues };
    };

    ipChanged = field => {
        this.hasEdits = true;
        this.convertToType(field);
        if (field === constants.masterKitId && this.isNew) {
            this.rackBuilderService.checkForRackNameValidity(this.rackDetails.controls[constants.masterKitId].value, this.rackDetails.controls[constants.rackTypesKey].value).subscribe(res => {
                const idx = this.invalidFields.indexOf(constants.masterKitId);
                if (res['StatusType'] === 'ERROR') {
                    if (idx === -1) {
                        this.invalidFields.push(constants.masterKitId);
                    }
                } else {
                    if (idx > -1 && !this.isEmpty(this.rackDetails.controls[constants.masterKitId].value)) {
                        this.invalidFields.splice(idx, 1);
                    }
                }
            })
            return;
        }
        this.isFieldInvalid(field);
    };

    convertToType = field => {
        if (constants.numberFields.indexOf(field) > -1) {
            const value = this.rackDetails.controls[field].value;
            if (value === ".") {
                this.rackDetails.controls[field].setValue(null);
                return;
            }
            if (typeof value !== "number" && !this.emptyField(value, "")) {
                this.rackDetails.controls[field].setValue(parseFloat(value));
            }
            return;
        }
    };

    isFieldInvalid = item => {
        if (
            constants.fieldsMap[this.currentRackType].findIndex(
                fieldToCompare => item === fieldToCompare.field
            ) > -1 && constants.nonMandatoryFields[this.currentRackType].indexOf(item) === -1
        ) {
            const idx = this.invalidFields.indexOf(item);
            if (idx !== -1) {
                this.invalidFields.splice(idx, 1);
            }
            if (
                this.rackDetails.controls[item] &&
                this.emptyField(
                    this.rackDetails.controls[item].value,
                    Array.isArray(this.rackDetails.controls[item].value)
                        ? constants.dropDowns[item]
                        : ""
                )
            ) {
                this.invalidFields.push(item);
            }
        }
    };

    cnfrmRackTypeChange = () => {
        this.currentRackType = this.newRacktype;
        const kitId = this.rackDetails.controls[constants.masterKitId].value;
        this.resetDDValues();
        this.rackDetails.reset();
        this.buildRackTypeForm(true);
        this.rackDetails.controls[constants.masterKitId].setValue(kitId);
        this.disableKeyFields(this.isNew);
        this.invalidFields = [];
        this.rackValues = {};
        this.rackTypeChangeCnfrmtn = false;
    };

    cancelRackTypeChange = () => {
        this.currentRackType = this.getDDValue(
            this.dropDownvalues[constants.rackTypesKey],
            constants.dropDowns[constants.rackTypesKey]
        );
        this.changeSelectedDDValue(
            constants.rackTypesKey,
            this.currentRackType,
            constants.rackType
        );
        this.rackTypeChangeCnfrmtn = false;
    };

    checkIfFieldsAreEmpty = () => {
        let empty = true;
        const fieldsToIgnore = [constants.rackTypesKey, constants.masterKitId];
        constants.fieldsMap[this.currentRackType].map(({ field }) => {
            if (
                empty &&
                fieldsToIgnore.indexOf(field) === -1 &&
                this.rackDetails.controls[field] &&
                !this.emptyField(
                    this.rackDetails.controls[field].value,
                    constants.dropDowns[field] ? constants.dropDowns[field] : ""
                )
            ) {
                empty = false;
            }
        });

        return empty;
    };

    getDDValue = (arr, key) => {
        if (arr) {
            const displayOption = arr.filter(opt => opt.IsSelected);
            return displayOption[0] ? displayOption[0][key] : "";
        }
    };

    emptyField = (value, ddKey) => {
        if (Array.isArray(value)) {
            value = this.getDDValue(value, ddKey);
        }
        return this.isEmpty(value);
    };

    // Table functions

    onSort = field => { };

    setSelectedRows = () => {
        this.selectedRows = {};
        const selectedRows = {};
        this.assignmentTableData.forEach(row => {
            if (row.IsSelected) {
                selectedRows[row[constants.branch]] = true;
            }
        });
        this.selectedRows = { ...selectedRows };
    }

    selectAllToggled = checked => {
        this.hasEdits = true;
        if (checked) {
            this.selectAllChkBxStatus = true;
            this.assignmentTableData.forEach(row => {
                this.rowSelectionChanged(checked, row);
            });
            return;
        }

        if (!checked) {
            this.selectAllChkBxStatus = false;
        }

        this.selectedRows = {};
    };

    rowSelectionChanged = (checked, row) => {
        this.hasEdits = true;
        checked
            ? (this.selectedRows[row[constants.branch]] = true)
            : delete this.selectedRows[row[constants.branch]];

        if (!checked) {
            this.selectAllChkBxStatus = false;
        }
    };

    confirmValues = () => {
        this.areFieldsValid();
        if (this.invalidFields.length > 0) {
            return;
        }

        const { valid, errMsg } = this.checkStipulations();
        if (valid) {
            const parsedDDValues = {};
            for (const field in this.rackDetails.value) {
                if (Array.isArray(this.rackDetails.value[field])) {
                    parsedDDValues[field] = this.getDDValue(
                        this.rackDetails.value[field],
                        constants.dropDowns[field]
                    );
                }
            }
            this.rackValues = { ...this.rackDetails.value, ...parsedDDValues, [constants.rackTypesKey]: this.currentRackType };
        } else {
            this.rackBuilderService.displayMessage("error", errMsg);
        }
    };

    areFieldsValid = () => {
        constants.fieldsMap[this.currentRackType].map(item => {
            if (this.checkRackStipulation(item.field)) {
                return;
            }
            this.isFieldInvalid(item.field);
        });
    };

    checkRackStipulation = field => {
        /*  if (this.isNew && field === constants.masterKitId) {
             return true;
         } */

        if (
            field === constants.rollersPerShelf ||
            field === constants.rollerHeight
        ) {
            /* const rollerValue = this.getDDValue(
                this.rackDetails.controls[constants.rollers].value,
                constants.dropDowns[constants.rollers]
            ) */;
            const rollerValue = this.rackDetails.controls[constants.rollers].value;
            if (rollerValue && rollerValue.toUpperCase() === "NO") {
                return true;
            }

            return false;
        }
    };

    checkStipulations = () => {
        let valid = true;
        let errMsg = "";

        const commonChecks = () => {
            if (
                this.rackDetails.controls[constants.height].value /
                this.uomConversion >
                constants.maxRackHeight
            ) {
                valid = false;
                errMsg = "Rack height exceeds 60 inches or  150 cm";
                return;
            }
        };

        const shelfTypeChecks = () => {
            // bottom shelf should be over 15"
            if (
                this.rackDetails.controls[constants.height].value /
                this.uomConversion <
                constants.minShelfHeight
            ) {
                valid = false;
                errMsg = "Rack height should exceed 15 inches";
                return;
            }

            // top shelf height should not exceed 60"

            if (
                this.rackDetails.controls[constants.totalPlacements].value *
                this.rackDetails.controls[constants.shelfHeight].value >
                this.rackDetails.controls[constants.height].value
            ) {
                valid = false;
                errMsg = "Shelves height exceeds 60 inches or  150 cm";
                return;
            }
            // check min shelf height

            /* const shelfHeight = ((this.rackDetails.controls[constants.height].value / this.uomConversion) - constants.bottomShelfHeight) / (this.rackDetails.controls[constants.totalPlacements].value );
      if ( shelfHeight < constants.shelfMinHeight) {
        valid = false;
        errMsg = `Shelf height cannot be less than ${constants.shelfMinHeight}"`;
      } */
        };

        const hoseReelChecks = () => {
            // bottom shelf should be over 15"
            if (
                this.rackDetails.controls[constants.height].value /
                this.uomConversion <
                constants.minShelfHeight
            ) {
                valid = false;
                errMsg = "Rack height should exceed 15 inches";
                return;
            }

            const placmentheight =
                this.rackDetails.controls[constants.height].value /
                this.rackDetails.controls[constants.totalPlacements].value;

            if (
                placmentheight / this.uomConversion <
                constants.hoseReelPlacementMinDstnce
            ) {
                valid = false;
                errMsg = "Placement height is not enough to fit a hose reel.";
            }
        };

        const bagTypeChecks = () => { };

        const hoseTypeChecks = () => { };

        commonChecks();

        if (!valid) {
            return { valid, errMsg };
        }

        switch (this.currentRackType) {
            case constants.shelfTypeKey:
                shelfTypeChecks();
                break;
            case constants.bagTypeKey:
                bagTypeChecks();
                break;
            case constants.hoseTypeKey:
                hoseTypeChecks();
                break;
            case constants.hoseReelTypeKey:
                hoseReelChecks();
                break;
        }

        return { valid, errMsg };
    };

    rackBuilderSave = () => {
        if (this.isEditable) {
            const getrackDetailsPostData = () => {
                const postData = { ...this.rackDetails.value };
                constants.keyFieldsToDisable.forEach(field => {
                    postData[field] = this.rackDetails.controls[field].value;
                });
                for (const dd in constants.dropDowns) {
                    if (this.rackDetails.value[dd]) {
                        postData[dd] = this.dropDownvalues[dd].map(opt => ({ ...opt, IsSelected: opt[constants.dropDowns[dd]] === this.rackDetails.value[dd] }))
                    }
                }

                return postData;
            }


            const getSegmentsPostData = () => {
                return this.segments.map(segment => ({
                    ORG_ID: segment,
                    IsSelected: this.selectedSegments.indexOf(segment) > -1
                }));
            };

            const getAssignmentTblPostData = () => {
                return this.assignmentTableData.map(row => ({
                    ...row,
                    IsSelected: this.selectedRows[row[constants.branch]]
                        ? true
                        : false
                }));
            };

            const postData = {
                [constants.rackDetailsAPIKey]: getrackDetailsPostData(),
                [constants.segmentsListAPIKey]: getSegmentsPostData(),
                [constants.racksTableAPIKey]: getAssignmentTblPostData()
            };

            this.coreService.showLoader();
            this.rackBuilderService.saveDetails(postData).subscribe(res => {
                if (res["StatusType"] === "SUCCESS") {
                    this.hasEdits = false;
                    if (this.isNew) {
                        this.isNew = false;
                        this.disableKeyFields(this.isNew);
                    }
                    this.rackBuilderService.displayMessage(
                        "success",
                        res["Message"]
                    );
                    if (this.isNew) {
                        this.isNew = false;
                        this.disableKeyFields(this.isNew);
                    }
                } else {
                    this.rackBuilderService.displayMessage(
                        "error",
                        res["Message"]
                    );
                }
                this.coreService.hideLoader();
            });
        }
    };

    ngOnDestroy() {
        this.dialog.ngOnDestroy();
        this.rackTypeChangeCnfrmtn = false;
    }

    canDeactivate = () => {
        this.dialog.ngOnDestroy();
        this.rackTypeChangeCnfrmtn = false;
        if (this.hasEdits && this.isEditable) {
            this.routeDeactivated = true;
            this.modalService.open();
            return this.modalService.getConfirmationSubject();
        }
        return true;
    };
}
