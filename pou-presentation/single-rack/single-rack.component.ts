import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewChecked, AfterViewInit, ViewEncapsulation } from "@angular/core";
import { Router } from "@angular/router";
import { FormGroup, FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import * as constants from "./../constants";
import { PouSingleRackService } from "./../pou-single-rack.service";
import { SharedService } from "./../../../shared/services/share.service";
import { ToastrService } from 'ngx-toastr';
import { PartsGridComponent } from "./parts-grid/parts-grid.component";
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { CoreServices } from '../../../core/services/core.service';
import * as singleRackConstants from './single-rack-constants';
import { SvgSingleRackComponent } from './svg-single-rack/svg-single-rack.component';
import { SingleRackService } from './single-rack.service';

declare let jsPDF: any;
export interface searchReqData {
  FACILITY_ID: String;
  WORK_CENTER_ID: String;
}

@Component({
  selector: 'pfep-single-rack',
  templateUrl: './single-rack.component.html',
  styleUrls: ['./single-rack.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SingleRackComponent implements OnInit {
  wildCardLookUpConfig: Array<any> = JSON.parse(JSON.stringify(constants.wildCardLookUpConfig));
  tableFieldsForParts: any;
  tableFieldsForRack: any;
  workCenterMasterRackTableField: any;
  searchReq: searchReqData;
  wcpGridData: any;
  wcGridData: any;
  loading: boolean = false;
  showAddRackPopup: boolean;
  scrollButton: boolean;
  wcRack: string = '';
  wcPart: string = '';
  wcMasterRack: string = '';
  scrollText: string = '';
  masterRack: any;
  selectbox: FormGroup;
  addRackCont: any = {};
  getSelectedRowIndex: any[];
  saveReq: any;
  dataOpened: any = { itemPlanRequest: {} };
  showSVG = false;
  rackTypeKey = singleRackConstants.rackTypeKey;
  shelfTypeKey = singleRackConstants.shelfTypeKey;
  bagTypeKey = singleRackConstants.bagTypeKey;
  hoseReelTypeKey = singleRackConstants.hoseReelTypeKey;
  hoseRackTypeKey = singleRackConstants.hoseRackTypeKey;
  itemsAddedtoRack: any = {};
  parentIp = {
    isChild: false,
    parentScreenPath: ''
  };
  pauseChangeEvent: boolean = false;
  wcrIDSaveFlag: boolean = false;
  searchResultFlag: boolean = false;
  dropDownValues: any = { [constants.presentation]: [] };
  selectedRackInfo: any = {
    selectedRackType: '',
    [singleRackConstants.rackID]: '',
    [singleRackConstants.rackSID]: '',
    [singleRackConstants.notesKey]: '',
  }
  notesKey = singleRackConstants.notesKey;
  rackIdKey = singleRackConstants.rackID;
  pdfTableData: Array<any> = [];
  disableDownload: boolean = true;

  @ViewChild(SvgSingleRackComponent) svgSingleRackComponent;
  @ViewChild(PartsGridComponent) partsGridComponent;
  @ViewChild('popuptable') popuptable: any;
  @ViewChild('masterRackTable') masterRackTable: any;
  @ViewChild('partsTable') partsTable: any;
  @ViewChild('itemsGrid') itemsGrid: any;
  @ViewChild('shelfRack') shelfRack: any;
  @ViewChild('bagRack') bagRack: any;
  @ViewChild('hoseReelRack') hoseReelRack: any;
  @ViewChild('hoseRack') hoseRack: any;
  @ViewChild('focusInput') focusInput: ElementRef;
  @ViewChild('notesText') notesText;
  @ViewChild('inplace') inplace;

  pocDetails: any;
  svgInitLoad: any;
  bagRow: any;
  noOfPlacements: number;
  btnData: any;
  searchClicked: boolean = false;
  chkItemExistFlag: boolean;

  constructor(
    public pouSingleRackService: PouSingleRackService,
    public coreService: CoreServices,
    private fb: FormBuilder,
    public sharedService: SharedService,
    private toastr: ToastrService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private readonly elref: ElementRef,
    private readonly singleRackService: SingleRackService
  ) {
    this.searchReq = {
      FACILITY_ID: '',
      WORK_CENTER_ID: ''
    };
    this.scrollButton = false;
    this.wcpGridData = [];
    this.wcGridData = [];
    this.masterRack = [];
    this.getSelectedRowIndex = [];
    this.showAddRackPopup = false;
    this.selectbox = this.fb.group({
      'noOfCount': [null, false],
      'noOfHooks': [null, false]
    });
  }

  ngOnInit() {
    this.tableFieldsForParts = constants.singleRackTableFields;
    this.tableFieldsForRack = constants.workCenterRackTableField;
    this.workCenterMasterRackTableField = constants.workCenterMasterRackTableField;
    this.wildCardLookUpConfig = JSON.parse(JSON.stringify(constants.wildCardLookUpConfig));
    this.coreService.showLoader();
    this.pouSingleRackService.getPresentationTypeValues().subscribe(res => {
      if (res.status === 200 && Array.isArray(res.body)) {
        this.dropDownValues[constants.presentation] = res.body;
      } else {
        this.dropDownValues[constants.presentation] = [];
      }
      this.coreService.hideLoader();
      this.sharedService.getRouteAttachedSubject().subscribe(route => {
        if (route === constants.singleRackKey) {
          this.checkInput();
        }
      });
      this.checkInput();
    });
  }

  checkInput = () => {
    this.parentIp = this.sharedService.getSingleRackIp();
    this.sharedService.setSingleRackIp({});
    if (!this.isEmpty(this.parentIp[constants.branch]) && !this.isEmpty(this.parentIp[constants.workCenterDDKey])) {
      this.sharedService.isHierarchy.next(this.parentIp);
      this.pauseChangeEvent = true;
      this.wildCardLookUpConfig = JSON.parse(JSON.stringify(constants.wildCardLookUpConfig))
      this.wildCardLookUpConfig[0].selectedData = this.parentIp[constants.branch];
      this.wildCardLookUpConfig[0] = { ...this.wildCardLookUpConfig[0] };
      this.wildCardLookUpConfig[1].selectedData = this.parentIp[constants.workCenterDDKey];
      this.wildCardLookUpConfig[1]['dependentData'] = {
        ...{ [constants.branch]: this.parentIp[constants.branch] }
      };
      this.wildCardLookUpConfig[1] = { ...this.wildCardLookUpConfig[1] };
      this.wildCardLookUpConfig = [...this.wildCardLookUpConfig];
      this.searchReq = {
        [constants.branch]: this.parentIp[constants.branch],
        [constants.workCenterDDKey]: this.parentIp[constants.workCenterDDKey]
      };
      this.getOnSearchGridData(this.parentIp[singleRackConstants.rackSID] ? true : false);
      setTimeout(() => {
        this.pauseChangeEvent = false;
      }, 500);
    }
  }

  isEmpty = value => [null, '', undefined].indexOf(value) > -1;

  generateSvg(event) {
    if (event === true && this.svgSingleRackComponent !== undefined) { this.svgSingleRackComponent.generateSvg(); }
  }
  counter(i: number) {
    return new Array(i);
  }

  CallFrPart() {
    this.sharedService.on<any>('addRckBtnData').subscribe((data: any) => {
      this.btnData = data;
    });
    if (this.btnData !== null && !this.itemsAddedtoRack[this.pouSingleRackService.getUniqueItemKey(this.btnData)]) {
      this.itemsAddedtoRack = { ...this.itemsAddedtoRack, [this.pouSingleRackService.getUniqueItemKey(this.btnData)]: true };
      this.disableDownload = true;
    }
    this.btnData = null;
  }

  eblAddRckBtnData(event) {
    if (this.itemsAddedtoRack[this.pouSingleRackService.getUniqueItemKey(event)]) {
      delete this.itemsAddedtoRack[this.pouSingleRackService.getUniqueItemKey(event)];
      this.disableDownload = true;
    }
    this.itemsAddedtoRack = { ...this.itemsAddedtoRack };
  }

  maxItemPerRow(evt) {
    const rackViewChildren = (this.pocDetails['WorkCenterRack']['MasterRack'][this.rackTypeKey] === 'Bag') ? this.bagRack : this.hoseRack;
    evt = (evt) ? evt : window.event;
    let charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    } else {
      if (this.chkIfRackItmExist(rackViewChildren)) {
        this.confirmationService.confirm({
          message: 'Are you sure you want to remove all items?',
          header: 'Confirmation',
          accept: () => {
            rackViewChildren.filteredDatas.forEach(data => {
              data['RackItems'] = [];
            });
            rackViewChildren.filteredDatas1.forEach(data => {
              data['RackItems'] = [];
            });
            this.rmDisableForPart();
            rackViewChildren.maxItmPerRow = Number(this.selectbox.get('noOfHooks').value);
            this.focusInput.nativeElement.focus();
            const shelfData = { ...this.pocDetails };
            shelfData.WorkCenterRack.LEFT_HOOK_ITEMS = rackViewChildren.filteredDatas;
            shelfData.WorkCenterRack.RIGHT_HOOK_ITEMS = rackViewChildren.filteredDatas1;
            this.sharedService.setSingelRacksvg(shelfData);
            this.generateSvg(true);
            return true;
          },
          reject: () => {
            // this.msgs = [{ severity: 'info', summary: 'Rejected', detail: 'You have rejected' }];
          }
        });
      } else {
        rackViewChildren.maxItmPerRow = this.selectbox.get('noOfHooks').value;
      }
    }
  }
  chkIfRackItmExist(rackViewChildren: any) {
    rackViewChildren.filteredDatas.some(data => {
      this.chkItemExistFlag = data['RackItems'].length > 0;
      return data['RackItems'].length > 0;
    })
    if (this.chkItemExistFlag === false) {
      rackViewChildren.filteredDatas1.some(data => {
        this.chkItemExistFlag = data['RackItems'].length > 0;
        return data['RackItems'].length > 0;
      })
    }
    return this.chkItemExistFlag;
  }

  getNoofPlacements(event) {
    this.noOfPlacements = event;
  }
  rmDisableForPart() {
    this.itemsAddedtoRack = {};
    this.disableDownload = true;
  }
  getNoOfRowCount(data) {
    if (this.selectbox.get('noOfCount').value !== null) {
      switch (this.pocDetails['WorkCenterRack']['MasterRack'][this.rackTypeKey]) {
        case 'Shelf':
          const count = this.selectbox.get('noOfCount').value;
          this.shelfRack.getNoOfShelf(count);
          break;
        case 'Bag':
          const count1 = this.selectbox.get('noOfCount').value;
          this.bagRack.getNoOfRow(count1);
          break;

        case 'Hose Reel':
          const count2 = this.selectbox.get('noOfCount').value;
          this.hoseReelRack.getNoOfShelf(count2);
          break;

        case 'Hose Rack':
          const count3 = this.selectbox.get('noOfCount').value;
          this.hoseRack.getNoOfRow(count3);
          break;
      }
    }

  }
  wildCardChangeEvent(event) {
    if (!this.pauseChangeEvent) {
      this.searchReq[event.modelName] = event.selectedData;
      if (event.modelName === constants.branch) {
        this.searchReq[constants.workCenterDDKey] = '';
        this.wildCardLookUpConfig[1]['dependentData'] = {
          ...{ [constants.branch]: event.selectedData }
        };
        this.wildCardLookUpConfig[1]['selectedData'] = '';
        this.wildCardLookUpConfig[1] = { ...this.wildCardLookUpConfig[1] };
      }
    }
  }
  getOnSearchGridData(hasWCID?) {
    this.searchClicked = true;
    this.selectedRackInfo = {
      selectedRackType: '',
      [singleRackConstants.rackID]: '',
      [singleRackConstants.rackSID]: '',
      [singleRackConstants.notesKey]: '',
    };
    this.searchResultFlag = false;
    if (this.searchReq.WORK_CENTER_ID !== '' && this.searchReq.FACILITY_ID !== '') {
      this.coreService.showLoader();
      this.loading = true;
      this.pouSingleRackService.pouPresentationSearch(this.searchReq).subscribe(data => {
        if (data['StatusType'] === 'SUCCESS') {
          this.searchResultFlag = true;
          this.addWidthKey(data['WorkCenterParts']);
          this.wcpGridData = data['WorkCenterParts'];
          this.wcGridData = data['WorkCenterRacks'];
          this.wcRack = 'WorkCenterRacks';
          this.wcPart = 'WorkCenterParts';
          this.wcMasterRack = 'WorkCenterMasterRacks';
          if (hasWCID) {
            this.parentFunforgetRack({ [singleRackConstants.rackSID]: this.parentIp[singleRackConstants.rackSID] });
          }
        } else {
          this.toastr.error(data['Message']);
        }
        this.wcrIDSaveFlag = false;
        this.searchClicked = true;
        this.coreService.hideLoader();
        this.showSVG = false;
        this.scrollButton = false;
        this.loading = false;
      })
    };
    this.getWorkInsight(this.searchReq.FACILITY_ID, this.searchReq.WORK_CENTER_ID)
  }

  addWidthKey(data1) {
    data1.forEach(data => {
      if (data.PRESENTATION_TYPE === 'Hand Stack') {
        data.width = data.HANDSTACK_SPACE_WIDTH;
        data.height = data.HANDSTACK_SPACE_HEIGHT;
        // data.width = 5;
        // data.height = 5;
        data.IS_EMPTY_ITEM_PLCMNT = false;
      } else {
        switch (true) {
          case data.CONTAINER_ORIENTATION === null && data.PRIMARY_ORIENTATION_LORW !== null:
            const width = data.PRIMARY_ORIENTATION_LORW === 'W' ? data.CONTAINER_OUT_WIDTH : data.CONTAINER_OUT_LENGHT;
            data.width = width;
            data.height = data.CONTAINER_OUT_HEIGHT;
            data.IS_EMPTY_ITEM_PLCMNT = false;
            break;
          case data.CONTAINER_ORIENTATION !== null && data.PRIMARY_ORIENTATION_LORW === null:
            const width1 = data.CONTAINER_ORIENTATION === 'W' ? data.ITEM_WIDTH : data.ITEM_LENGTH;
            data.width = width1;
            data.height = data.ITEM_HEIGHT;
            data.IS_EMPTY_ITEM_PLCMNT = false;
            break;
          case data.CONTAINER_ORIENTATION === null && data.PRIMARY_ORIENTATION_LORW === null:
            data.width = null;
            data.height = null;
            data.IS_EMPTY_ITEM_PLCMNT = true;
            break;
          case data.CONTAINER_ORIENTATION !== null && data.PRIMARY_ORIENTATION_LORW !== null:
            const width2 = (data.CONTAINER_ORIENTATION === 'W' ? this.takeLOrW(data, 'ITEM_WIDTH', 'CONTAINER_OUT_WIDTH') :
              this.takeLOrW(data, 'ITEM_LENGTH', 'CONTAINER_OUT_LENGHT'));
            data.width = width2;
            data.height = data.ITEM_HEIGHT ? data.ITEM_HEIGHT : data.CONTAINER_OUT_HEIGHT;
            data.IS_EMPTY_ITEM_PLCMNT = false;
        }
      }
    })
  }

  takeLOrW(data: any, value1: string, value2: string) {
    return data[value1] !== null ? data[value1] : data[value2];
  }

  getWorkInsight(facilityID: any, workcenterId: any) {
    this.pouSingleRackService.workInsight(facilityID, workcenterId).subscribe(data => {
    });
  }

  addRack() {
    this.masterRackTable.selectedRow = [];
    this.showAddRackPopup = true;
    this.coreService.showLoader();
    this.pouSingleRackService.getmasterRackDetails(this.searchReq.FACILITY_ID).subscribe((data: any) => {
      this.masterRack = data.MasterRacks;
      this.coreService.hideLoader();
    });
  }

  addWcRack() {
    if (this.popuptable.selectedRow.length > 0) {
      this.popuptable.getRowIndex = [];
      this.popuptable.selectedRow.forEach(data => {
        if (data.WC_STORAGE_UNIT_ID === null || data.WC_STORAGE_UNIT_ID === '') {
          this.popuptable.getRowIndex.push(this.masterRack.indexOf(data));
        }
      });
      if (this.popuptable.getRowIndex.length === 0) {
        const wcr = [];
        const req = {
          "FACILITY_ID": this.searchReq.FACILITY_ID,
          "WORK_CENTER_ID": this.searchReq.WORK_CENTER_ID,
          "WorkCenterRack": wcr
        };
        this.popuptable.selectedRow.forEach(data => {
          wcr.push({
            "WC_STORAGE_UNIT_ID": data.WC_STORAGE_UNIT_ID,
            "STORAGE_UNIT_ID": data.STORAGE_UNIT_ID
          });
        });
        this.pouSingleRackService.createRack(req).subscribe((data: any) => {
          this.toastr.success(data.Message, '', { disableTimeOut: false });
          this.getRackListItems();
        });
        this.showAddRackPopup = false;

      }
    } else {
      this.toastr.error('Please Select a Rack Type');
    }
  }
  onloadSvgID(event) {
    this.pouSingleRackService.getRackDetails(event).subscribe(data => {
      this.showSVG = true;
      this.pocDetails = data;
      this.coreService.hideLoader();
    })
  }
  removeRackFromGrid() {
    this.confirmationService.confirm({
      message: 'Are you sure?',
      header: 'Confirmation',
      accept: () => {
        const ids: any = [];
        this.masterRackTable.selectedRow.forEach(data => {
          ids.push(data.WC_STORAGE_UNIT_SID);
        });
        const req = {
          'WorkCenterRackSIDs': ids
        };
        this.pouSingleRackService.removeRack(req).subscribe((data: any) => {
          this.toastr.success(data.Message, '', { disableTimeOut: false })
          this.showSVG = false;
          this.getOnSearchGridData();
        });
      },
      reject: () => {
        // this.msgs = [{ severity: 'info', summary: 'Rejected', detail: 'You have rejected' }];
      }
    });

  }
  getRackListItems() {
    this.pouSingleRackService.getRackList(this.searchReq).subscribe(data => {
      this.wcGridData = data['WorkCenterRacks'];
    });
  }
  parentFun() {
    this.scrollButton = true;
    this.scrollText = 'Go to Work Center Parts';
    let item = this.elref.nativeElement.querySelector('.section-2-header');
    let count = item.offsetTop - 200; // xx = any extra distance from top ex. 60
    window.scrollTo({ top: count, left: 0, behavior: 'smooth' });
    this.addRackCont = {};
    this.addRackCont = this.itemsGrid.partsSelectedData;

  }
  checkScroll() {
    if (this.scrollText === 'Go to Work Center Parts') {
      this.scrollText = 'Go to Rack Details';
      this.elref.nativeElement.querySelector('.work-center-part').scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      this.scrollText = 'Go to Work Center Parts';
      let item = this.elref.nativeElement.querySelector('.section-2');
      let count = item.offsetTop - 235; // xx = any extra distance from top ex. 60
      window.scrollTo({ top: count, left: 0, behavior: 'smooth' });
    }
  }

  ctrAdded = () => {
    this.addRackCont = null;
    this.scrollButton = false;
  }

  parentFunforgetRack(event) {

    this.coreService.showLoader();
    this.parentIp[singleRackConstants.rackSID] = event[singleRackConstants.rackSID];
    this.pouSingleRackService.getRackDetails(event[singleRackConstants.rackSID]).subscribe(data => {
      this.coreService.hideLoader();
      this.showSVG = true;
      this.pocDetails = data;
      this.sharedService.setSingelRacksvg(data);
      this.generateSvg(true);
      this.selectbox.reset();
      this.selectedRackInfo = {
        selectedRackType: data['WorkCenterRack']['MasterRack'][singleRackConstants.rackTypeKey],
        [singleRackConstants.rackID]: data['WorkCenterRack'][singleRackConstants.rackID],
        [singleRackConstants.rackSID]: data['WorkCenterRack'][singleRackConstants.rackSID],
        [singleRackConstants.notesKey]: data['WorkCenterRack'][singleRackConstants.notesKey] || '',
        itemAddedToRack: []
      }
      this.determinedItemsPresentInRack(data);
      //this.selectedRackInfo.itemsAddedtoRack = { ...{}, ...this.itemsAddedtoRack };
      if (this.pocDetails['WorkCenterRack']['MasterRack'][this.rackTypeKey] === 'Bag' || this.pocDetails['WorkCenterRack']['MasterRack'][this.rackTypeKey] === 'Hose Rack') {
        this.selectbox.patchValue({
          noOfHooks: this.pocDetails['WorkCenterRack']['ACTL_NBR_BAG_HOOKS_PER_PLCMNT']
        });
      }
      // Allowing some time to disable iirelevant Items
      setTimeout(() => {
        this.itemsGrid.checkAndSortToRelevance();
        this.disableDownload = false;
      }, 100);
    });
  }

  determinedItemsPresentInRack = data => {
    this.itemsAddedtoRack = {};
    switch (this.selectedRackInfo.selectedRackType) {
      case 'Shelf':
        this.itemsinShelf(data);
        break;
      case 'Bag':
        this.itemsinBagRack(data);
        break;
      case 'Hose Rack':
        break;
      case 'Hose Reel':
        break;
    }
  }

  itemsinShelf = data => {
    const assignItems = arr => {
      arr.forEach((row) => {
        this.itemsAddedtoRack[this.pouSingleRackService.getUniqueItemKey(row)] = true;
      });
    }

    const placements = data['WorkCenterRack']['WorkCenterRackItems'];
    placements.forEach(({ RackItems }) => assignItems(RackItems));
    const handStackItems = [...data['WorkCenterRack']['LEFT_ITEMS'], ...data['WorkCenterRack']['RIGHT_ITEMS']]
    assignItems(handStackItems);
    this.itemsAddedtoRack = { ...this.itemsAddedtoRack };
  }

  itemsinBagRack = data => {
    [...(data['WorkCenterRack']['LEFT_HOOK_ITEMS'] || []), ...(data['WorkCenterRack']['RIGHT_HOOK_ITEMS'] || [])].forEach(({ RackItems }) => {
      if (RackItems.length > 0) {
        RackItems.forEach(item => this.itemsAddedtoRack[this.pouSingleRackService.getUniqueItemKey(item)] = true)
      }
    });
    this.itemsAddedtoRack = { ...this.itemsAddedtoRack };
  }

  rackIdChanged = e => {
    this.selectedRackInfo[singleRackConstants.rackID] = e.target.value;
  }

  editNotes = (shouldActivate) => {
    if (shouldActivate) {
      this.inplace.activate();
    }
    setTimeout(() => { this.notesText.nativeElement.focus() }, 0);
  }

  saveNotes = (textEle) => {
    this.inplace.deactivate();
    this.selectedRackInfo[singleRackConstants.notesKey] = textEle.value;
    this.coreService.showLoader();
    this.pouSingleRackService.saveNotes(this.selectedRackInfo).subscribe(res => {
      if (res['StatusType'] === 'SUCCESS') {
        this.toastr.success(res['Message']);
        this.pocDetails['WorkCenterRack'][singleRackConstants.notesKey] = this.selectedRackInfo[singleRackConstants.notesKey];
      } else {
        this.toastr.error(res['Message']);
      }
      this.coreService.hideLoader();
    });
  }

  cancelNotes = () => {
    this.inplace.deactivate();
    this.notesText.nativeElement.value = this.selectedRackInfo[singleRackConstants.notesKey];
  }

  notesClosed = () => {
    this.inplace.deactivate();
    this.notesText.nativeElement.value = this.selectedRackInfo[singleRackConstants.notesKey];
  }

  onSave() {
    if (this.checkRacktype() || this.checkRackInfo()) {
      this.pouSingleRackService.onSaveData(this.saveReq).subscribe((data: any) => {
        if (data.StatusType === 'ERROR') {
          this.toastr.error(data.Message);
        } else {
          this.toastr.success('Saved successfully', '', { disableTimeOut: false });
          this.saveCheck();
          this.getOnSearchGridData(this.parentIp[singleRackConstants.rackSID] ? true : false);
          if (this.parentIp.parentScreenPath) {
            // to show success message before navigating
            setTimeout(() => {
              this.router.navigate([this.parentIp.parentScreenPath]);
            }, 300);
          }
        }
      });
    } else {
      this.toastr.info('No changes to save')
    }
  }

  checkRackInfo = () => {
    let valuesChanged = false;
    if (this.saveReq['WorkCenterRack'][singleRackConstants.rackID] !== this.selectedRackInfo[singleRackConstants.rackID]) {
      this.saveReq['WorkCenterRack'][singleRackConstants.rackID] = this.selectedRackInfo[singleRackConstants.rackID];
      valuesChanged = true;
    }
    if (this.saveReq['WorkCenterRack'][singleRackConstants.notesKey] !== this.selectedRackInfo[singleRackConstants.notesKey]) {
      this.saveReq['WorkCenterRack'][singleRackConstants.notesKey] = this.selectedRackInfo[singleRackConstants.notesKey];
      valuesChanged = true;
    }
    return valuesChanged;
  }

  saveCheck() {
    switch (this.pocDetails['WorkCenterRack']['MasterRack'][this.rackTypeKey]) {
      case 'Shelf':
        this.shelfRack.saveEnable = JSON.parse(JSON.stringify(this.shelfRack.filteredDatas));
        break;
      case 'Hose Reel':
        this.hoseReelRack.saveEnable = JSON.parse(JSON.stringify(this.hoseReelRack.filteredDatas));
        break;
    }

    this.pocDetails['WorkCenterRack'] = { ...this.pocDetails['WorkCenterRack'], [singleRackConstants.rackID]: this.selectedRackInfo[singleRackConstants.rackID], [singleRackConstants.notesKey]: this.selectedRackInfo[singleRackConstants.notesKey] }
  }
  onCancel() {
    this.router.navigate([this.parentIp.parentScreenPath]);
  }
  checkRacktype() {
    switch (this.pocDetails['WorkCenterRack']['MasterRack'][this.rackTypeKey]) {
      case 'Shelf':
        this.shelfRack.addKeyForReqFrame();
        let savrq = this.shelfRack.fullValue;
        delete savrq['StatusType'];
        delete savrq['Message'];
        savrq['WorkCenterRack']['WorkCenterRackItems'] = this.shelfRack['filteredDatas'];
        this.saveReq = savrq;
        return (JSON.stringify(this.shelfRack.saveEnable) !== JSON.stringify(this.shelfRack.filteredDatas)) ||
          (JSON.stringify(this.shelfRack.fullValHandStack['WorkCenterRack']['LEFT_ITEMS']) !==
            JSON.stringify(this.shelfRack.fullValue['WorkCenterRack']['LEFT_ITEMS'])) ||
          (JSON.stringify(this.shelfRack.fullValHandStack['WorkCenterRack']['RIGHT_ITEMS']) !==
            JSON.stringify(this.shelfRack.fullValue['WorkCenterRack']['RIGHT_ITEMS']));

        break;
      case 'Bag':
        this.bagRack.addKeyForReqFrame();
        let savrq1 = this.bagRack.fullValue;
        delete savrq1['StatusType'];
        delete savrq1['Message'];
        savrq1['WorkCenterRack']['LEFT_HOOK_ITEMS'] = this.bagRack['filteredDatas'];
        savrq1['WorkCenterRack']['RIGHT_HOOK_ITEMS'] = this.bagRack['filteredDatas1'];
        savrq1['WorkCenterRack']['ACTL_NBR_BAG_HOOKS_PER_PLCMNT'] = this.selectbox.get('noOfHooks').value;
        this.saveReq = savrq1;
        return (JSON.stringify(this.bagRack.saveEnable) !== JSON.stringify(this.bagRack.filteredDatas)) ||
          (JSON.stringify(this.bagRack.saveEnableBag) !== JSON.stringify(this.bagRack.filteredDatas1));

        break;
      case 'Hose Reel':
        this.hoseReelRack.addKeyForReqFrame();
        let savrqHoseReel = this.hoseReelRack.fullValue;
        delete savrqHoseReel['StatusType'];
        delete savrqHoseReel['Message'];
        savrqHoseReel['WorkCenterRack']['WorkCenterRackItems'] = this.hoseReelRack['filteredDatas'];
        this.saveReq = savrqHoseReel;
        return (JSON.stringify(this.hoseReelRack.saveEnable) !== JSON.stringify(this.hoseReelRack.filteredDatas));

        break;
      case 'Hose Rack':
        this.hoseRack.addKeyForReqFrame();
        let savrqHoseRack = this.hoseRack.fullValue;
        delete savrqHoseRack['StatusType'];
        delete savrqHoseRack['Message'];
        savrqHoseRack['WorkCenterRack']['LEFT_HOOK_ITEMS'] = this.hoseRack['filteredDatas'];
        savrqHoseRack['WorkCenterRack']['RIGHT_HOOK_ITEMS'] = this.hoseRack['filteredDatas1'];
        savrqHoseRack['WorkCenterRack']['ACTL_NBR_BAG_HOOKS_PER_PLCMNT'] = this.selectbox.get('noOfHooks').value;
        this.saveReq = savrqHoseRack;
        return (JSON.stringify(this.hoseRack.saveEnable) !== JSON.stringify(this.hoseRack.filteredDatas)) ||
          (JSON.stringify(this.hoseRack.saveEnableBag) !== JSON.stringify(this.hoseRack.filteredDatas1));

        break;
    }
  }

  itemDetailFn = data => {
    this.dataOpened = {
      ...data,
    };
    let req = {};
    // if (!this.isFromItemFlow) { this.dataOpened[constants.workCenterId] =  this.workCenterId; }

    if (this.parentIp.parentScreenPath !== '/item-plan-detail') {
      req = { isChild: true, parentScreenPath: '/pou/single-rack' }
    } else {
      req = { setUrl: true, backurl: '/item-plan-detail', isChild: false, parentScreenPath: '', navigateUrl: true };
    }
    this.sharedService.setItemPlanIp({
      ...this.dataOpened.itemPlanRequest, ...req
    });
    this.router.navigate(["/item-plan-detail"]);
  }

  wcrIDEditFlag(event) {
    this.wcrIDSaveFlag = event;
  }

  routeAttached = () => {
    this.checkInput();
    this.sharedService.isHierarchy.next({ back: true, backurl: this.router.url });
  }

  exportToPDF = shouldDownload => {
    if (!shouldDownload) {
      return;
    }
    this.coreService.showLoader();
    const pdf = new jsPDF('p', 'mm', 'a4');
    const a4Width = 210;

    //adding the rack id
    pdf.setFontSize(20);
    pdf.setTextColor('#076589');
    pdf.text('Work Center Rack ID:  ' + this.selectedRackInfo[singleRackConstants.rackID], a4Width / 2, 20, { align: 'center' });

    this.addVisualization(pdf, 30);
  }

  addVisualization = (pdf, startYPos) => {

    //adding the visualization sub text
    pdf.setFontSize(15);
    pdf.setTextColor('#d57e00');
    pdf.setFontStyle('italic');
    pdf.text('Visualization:', 10, startYPos + 10);

    //adding the visualization 
    const svgElement: any = document.querySelector("#rack-svg"),
      img = new Image(),
      serializer = new XMLSerializer(),
      svgStr = serializer.serializeToString(svgElement);
    const a4Width = 210;
    const a4Height = 240;
    const rectYCoOrd = startYPos + 15;
    const leftMargin = 10;
    // shelfTypeValues 
    let leftHandStackWidth = 0;
    let rightHandStackWidth = 0;
    // we have started svg at (50,50), so making handstack occupy that space, only applies for shelf type
    let offsetEquivalent = 40;

    if (this.selectedRackInfo.selectedRackType === singleRackConstants.shelfTypeKey) {
      var { rightItems = [], leftItems = [] } = this.shelfRack.getHandStackItems();
      leftHandStackWidth = 20;
      rightHandStackWidth = 20;
    }

    let imgWidth = svgElement.width.baseVal.value / 4;
    let imgHeight = svgElement.height.baseVal.value / 4;
    let rackWidthMultiplier = 4;
    while (rectYCoOrd + (svgElement.height.baseVal.value / rackWidthMultiplier) > (a4Height - 15) || leftMargin + (svgElement.width.baseVal.value / rackWidthMultiplier) + leftHandStackWidth + rightHandStackWidth > (a4Width - 20)) {
      rackWidthMultiplier++;
      imgWidth = svgElement.width.baseVal.value / rackWidthMultiplier;
      imgHeight = svgElement.height.baseVal.value / rackWidthMultiplier;
    }
    offsetEquivalent = offsetEquivalent / rackWidthMultiplier;

    /* Order to draw elements:

       1: background
       2: handStack Rectangle
       3: handStack text
       4: Image
   */

    // Y pos where the visualization ends
    let finalYPos = rectYCoOrd + 10 + imgHeight + 20;
    const imgStartPos = rectYCoOrd + 10;
    const imgBGStartYPos = rectYCoOrd;

    const svgImg = 'data:image/svg+xml;base64,' + window.btoa(svgStr);
    const canvas = document.createElement("canvas");
    canvas.width = svgElement.width.baseVal.value;
    canvas.height = svgElement.height.baseVal.value;
    const context = canvas.getContext("2d");
    img.src = svgImg;
    img.onload = () => {
      context.drawImage(img, 0, 0);
      const canvasdata = canvas.toDataURL("image/png");
      // drawing visualization background
      pdf.setDrawColor('#d57e00');
      pdf.setFillColor(222, 226, 230);
      pdf.roundedRect(10, imgBGStartYPos, 190, imgHeight + 20, 5, 5, 'F');

      const imgXPos = (a4Width - imgWidth) / 2;

      // adding handstacks if its shelf type
      if (this.selectedRackInfo.selectedRackType === singleRackConstants.shelfTypeKey) {

        const fontSize = (imgHeight - offsetEquivalent - 10) / 20 > 8 ? (imgHeight - offsetEquivalent - 10) / 20 : 8;
        pdf.setFontSize(fontSize);
        pdf.setTextColor('black');
        let yPos = imgStartPos + offsetEquivalent + 2;

        // Even though the logic for left and right handstack texts are the same, putting them in two separate code blocks to facilitate future customization
        const leftHandStackXPos = imgXPos - leftHandStackWidth;
        const rightHandStackXPos = imgXPos + imgWidth - offsetEquivalent;


        //  caluculating left handstack finalPos
        leftItems.forEach((item, idx) => {
          yPos += idx > 0 ? 5 : 2;
          const textLines = pdf.splitTextToSize(item[constants.itemId], leftHandStackWidth + offsetEquivalent, { fontSize });
          textLines.forEach((text, idx) => {
            yPos += (idx * 3);
          })
        });
        finalYPos = yPos;

        // caluculating right handstack finalPos
        yPos = imgStartPos + offsetEquivalent + 2;
        rightItems.forEach((item, idx) => {
          yPos += idx > 0 ? 5 : 2;
          const textLines = pdf.splitTextToSize(item[constants.itemId], leftHandStackWidth + offsetEquivalent, { fontSize });
          textLines.forEach((text, idx) => {
            yPos += (idx * 3);
          })
        });

        // taking the highest among leftHandStack YPos and right handstack YPos
        finalYPos = finalYPos > yPos ? finalYPos : yPos;

        //checking if imgHeight is greater than handStack finalYPos
        finalYPos = finalYPos > (imgHeight + imgStartPos) ? finalYPos : (imgHeight + imgStartPos);

        // drawing visualization background after handstack Items because sometimes the the visualization height may not be enough to sfit handstack items
        pdf.setDrawColor('#d57e00');
        pdf.setFillColor(222, 226, 230);
        // adding 20 padding from the image or handstack to background's height
        pdf.roundedRect(10, imgBGStartYPos, 190, finalYPos + 20 - imgBGStartYPos, 5, 5, 'F');

        // imgXPos - leftHandStackWidth (imgXPos include the offsetEquivalent)
        pdf.rect(leftHandStackXPos, imgStartPos + offsetEquivalent, leftHandStackWidth + offsetEquivalent, finalYPos - (imgStartPos + offsetEquivalent) + 2);
        pdf.rect(rightHandStackXPos, imgStartPos + offsetEquivalent, rightHandStackWidth + offsetEquivalent, finalYPos - (imgStartPos + offsetEquivalent) + 2);

        // bg end Pos
        finalYPos += 20;

        // adding left handstack
        yPos = imgStartPos + offsetEquivalent + 2;
        leftItems.forEach((item, idx) => {
          yPos += idx > 0 ? 5 : 2;
          const textLines = pdf.splitTextToSize(item[constants.itemId], leftHandStackWidth + offsetEquivalent, { fontSize });
          textLines.forEach((text, idx) => {
            yPos += (idx * 3);
            pdf.text(text, leftHandStackXPos + ((leftHandStackWidth + offsetEquivalent) / 2), yPos, { align: 'center' });
          })
        });

        // adding right handstack
        yPos = imgStartPos + offsetEquivalent + 2;
        rightItems.forEach((item, idx) => {
          yPos += idx > 0 ? 5 : 2;
          const textLines = pdf.splitTextToSize(item[constants.itemId], leftHandStackWidth + offsetEquivalent, { fontSize });
          textLines.forEach((text, idx) => {
            yPos += (idx * 3);
            pdf.text(text, rightHandStackXPos + ((rightHandStackWidth + offsetEquivalent) / 2), yPos, { align: 'center' });
          })
        });

      }
      pdf.addImage(canvasdata, 'PNG', imgXPos, imgStartPos, imgWidth, imgHeight, '', 'NONE');
      this.addTable(pdf, finalYPos);
    }
  }

  buildPdfTable = () => {
    const partsAddedData = this.wcpGridData.filter(part => !!this.itemsAddedtoRack[this.pouSingleRackService.getUniqueItemKey(part)]);
    this.pdfTableData = [...partsAddedData];
  }

  addTable = (pdf, rectYCoOrd) => {
    const startYPos = rectYCoOrd + 15;
    // add table
    pdf.setFontSize(15);
    pdf.setTextColor('#d57e00');
    pdf.setFontStyle('italic');
    pdf.text('Items added in Rack:', 3, startYPos);

    this.buildPdfTable();

    setTimeout(() => {
      pdf.autoTable({ html: '#table-export-pdf', includeHiddenHtml: true, styles: { fontSize: 7 }, headStyles: { fillColor: '#076589', textColor: '#ffffff', fontStyle: 'bold', halign: 'center' }, bodyStyles: { halign: 'center', 'overflow': 'linebreak' }, startY: startYPos + 5, margin: 3, minCellWidth: 13 });

      this.addNotes(pdf, pdf.lastAutoTable.finalY + 10);
    }, 0);
  }

  addNotes = (pdf, startYCoOrd) => {

    if (startYCoOrd > pdf.internal.pageSize.height - 8) {
      pdf.addPage();
    }

    // function to wrap text in PDF
    const addWrappedText = ({ text, textWidth, doc, fontSize = 10, fontType = 'normal', lineSpacing = 7, xPosition = 10, initialYPosition = 10, pageWrapInitialYPosition = 10 }) => {
      const textLines = doc.splitTextToSize(text, textWidth); // Split the text into lines
      const pageHeight = doc.internal.pageSize.height - 8;        // Get page height, well use this for auto-paging
      doc.setFontType(fontType);
      doc.setFontSize(fontSize);

      var cursorY = initialYPosition;

      textLines.forEach(lineText => {
        if (cursorY > pageHeight) { // Auto-paging
          doc.addPage();
          cursorY = pageWrapInitialYPosition;
        }
        doc.text(xPosition, cursorY, lineText);
        cursorY += lineSpacing;
      })
    }

    // add Notes sub text
    pdf.setFontSize(15);
    pdf.setTextColor('#d57e00');
    pdf.setFontStyle('italic');
    pdf.text('Notes:', 10, startYCoOrd);

    // add Notes
    pdf.setFontSize(10);
    pdf.setTextColor('#076589');
    pdf.setFontStyle('normal');
    addWrappedText({ text: this.selectedRackInfo[singleRackConstants.notesKey], textWidth: 180, fontSize: 10, initialYPosition: startYCoOrd + 10, doc: pdf });
    pdf.save(`${this.pocDetails['WorkCenterRack'][singleRackConstants.rackID]}.pdf`);
    this.coreService.hideLoader();
  }
}
