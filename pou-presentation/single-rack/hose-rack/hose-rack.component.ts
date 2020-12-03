import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDrag } from '@angular/cdk/drag-drop';
import { FormGroup, FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import * as singleRackConstants from '../single-rack-constants';
import { SharedService } from "./../../../../shared/services/share.service";

@Component({
  selector: 'pfep-hose-rack',
  templateUrl: './hose-rack.component.html',
  styleUrls: ['./hose-rack.component.scss']
})

export class HoseRackComponent implements OnInit {
  selectedArr: String[];
  replaceValue: String;
  flagString: String = '';
  flag: boolean;
  addItem: {};
  indexNo: number;
  addItemFlag: boolean;
  errMsgFlag: boolean;
  s1WidthHeight: any;
  s2WidthHeight: any;
  s3WidthHeight: any;
  addIndex: number;
  maxWidth: number = 600;
  remnWidth: number[];
  filteredDatas: any[];
  filteredDatas1: any[];
  swapArray: number[];
  swapArray1: number[];
  selectedItem: any;
  idxNo: number;
  fullValue: any;
  addRackItem: any;
  lastItem: any[];
  selectbox: FormGroup;
  rowCount: any;
  shelfHeight: any;
  shelfName: any;
  chkItemExistFlag: boolean;
  maxItmPerRow: number | string;
  ctrWidthScaleFt = singleRackConstants.ctrWidthScaleFt;
  //TODO: chanhe this according to UOM
  uomConversion = 12;
  saveEnable: any;
  saveEnableBag: any;
  // noOfPlacements: any;

  constructor(
    private toastr: ToastrService,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    public sharedService: SharedService) {
    this.flag = true;
    this.errMsgFlag = false;
    this.addItemFlag = false;
    this.filteredDatas = [];
    this.filteredDatas1 = [];
    this.swapArray = [];
    this.swapArray1 = [];
    this.remnWidth = [];
    this.lastItem = [];
  }
  @Input() pocDetails: any;
  @Input() set addRackCont(value) {
    if (value) {
      this.addRackItem = value;
    }
  }
  @Output() ctrAdded = new EventEmitter();
  @Output() generateSvg = new EventEmitter();
  @Output() noOfPlacements = new EventEmitter();
  @Output() bagCallPrtData = new EventEmitter();
  @Output() bagEblAddRckBtn = new EventEmitter();
  @Output() rmDisableBag = new EventEmitter();


  ngOnChanges(changes) {
    if ('pocDetails' in changes && changes.pocDetails.currentValue !== undefined &&
      changes.pocDetails.currentValue.WorkCenterRack.LEFT_HOOK_ITEMS !== null &&
      changes.pocDetails.currentValue.WorkCenterRack.RIGHT_HOOK_ITEMS !== null
    ) {
      const plcmnt = changes.pocDetails.currentValue.WorkCenterRack['ACTL_NBR_BAG_PLCMNTS'] !== null ?
        changes.pocDetails.currentValue.WorkCenterRack['ACTL_NBR_BAG_PLCMNTS'] :
        changes.pocDetails.currentValue.WorkCenterRack['MasterRack']['STD_NBR_PLCMNTS'];
      this.noOfPlacements.emit(plcmnt);
      this.filteredDatas = [...changes.pocDetails.currentValue.WorkCenterRack.LEFT_HOOK_ITEMS];
      this.filteredDatas1 = [...changes.pocDetails.currentValue.WorkCenterRack.RIGHT_HOOK_ITEMS];
      this.maxItmPerRow = this.pocDetails['WorkCenterRack']['ACTL_NBR_BAG_HOOKS_PER_PLCMNT'];
      this.saveEnable = JSON.parse(JSON.stringify(this.filteredDatas));
      this.saveEnableBag = JSON.parse(JSON.stringify(this.filteredDatas1));
      this.fullValue = changes.pocDetails.currentValue;
      this.shelfName = this.fullValue['WorkCenterRack']['MasterRack']['STORAGE_UNIT_TYPE'];
      this.swapArrayIndexFill();
    } else if ('pocDetails' in changes && changes.pocDetails.currentValue !== undefined &&
      changes.pocDetails.currentValue.WorkCenterRack.LEFT_HOOK_ITEMS === null &&
      changes.pocDetails.currentValue.WorkCenterRack.RIGHT_HOOK_ITEMS === null
    ) {
      this.filteredDatas = [];

    }

  }
  ngOnInit() {
    
  }


  getBagsvg() {
    let rackValues: any = this.fullValue;
    // rackValues.WorkCenterRackItems = this.filteredDatas;
    this.sharedService.setSingelRacksvg(rackValues);
    this.generateSvg.emit(true);
  }
  swapArrayIndexFill() {
    this.swapArray = [];
    this.swapArray1 = [];
    this.filteredDatas.forEach((value, index) => {
      this.swapArray.push(index);
    });
    this.filteredDatas1.forEach((value, index) => {
      this.swapArray1.push(index);
    });
  }
  getNoOfRow(data) {
    if (this.checkIfItemsExist()) {
      this.confirmationService.confirm({
        message: 'Are you sure you want to remove all items from the rack?',
        header: 'Confirmation',
        accept: () => {
          this.removeAllItemsInShelf(data);
          this.swapArrayIndexFill();
          this.rmDisableBag.emit('Bag');
        },
        reject: () => {
          // this.msgs = [{ severity: 'info', summary: 'Rejected', detail: 'You have rejected' }];
        }
      });
    } else {
      this.removeAllItemsInShelf(data);
    }
  }

  dragStart = () => {
    //debugger;
  }

  checkIfItemsExist() {
    this.filteredDatas.some(data => {
      this.chkItemExistFlag = data['RackItems'].length > 0;
      return data['RackItems'].length > 0;
    })
    if (this.chkItemExistFlag === false) {
      this.filteredDatas1.some(data => {
        this.chkItemExistFlag = data['RackItems'].length > 0;
        return data['RackItems'].length > 0;
      })
    }
    return this.chkItemExistFlag;
  }
  removeAllItemsInShelf(data) {
    this.filteredDatas = [];
    this.filteredDatas1 = [];
    if (this.filteredDatas.length === 0) {
      for (let i = 0; i < data; i++) {
        this.filteredDatas.push({ 'RackItems': [] });
        this.filteredDatas1.push({ 'RackItems': [] });
      }
    }
    const shelfData = { ...this.pocDetails };
    // shelfData.WorkCenterRack.WorkCenterRackItems = this.filteredDatas;
    shelfData.WorkCenterRack['ACTL_NBR_BAG_PLCMNTS'] = data;
    shelfData.WorkCenterRack.LEFT_HOOK_ITEMS = this.filteredDatas;
    shelfData.WorkCenterRack.RIGHT_HOOK_ITEMS = this.filteredDatas1;
    this.sharedService.setSingelRacksvg(shelfData);
    this.generateSvg.emit(true);
  }
  drop(event: CdkDragDrop<any[]>, arrName: string) {
    this.dragFunction(event);
  }

  dragFunction(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      if((this.maxItmPerRow === undefined || this.maxItmPerRow === '' || this.maxItmPerRow === null ||
      event.container.data.length < this.maxItmPerRow)) {
        transferArrayItem(event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex);
      } else {
        this.toastr.error(`Item can't be added to this placement, Items per Placement exceeded.`);
      }
    }
  }

  delete(event: any, idx: number, index: number, data: string) {
    event.stopPropagation();
    const rmItem = this[data][idx]['RackItems'][index];
    const inx = this.getAllIndexes(this[data][idx]['RackItems'], this[data][idx]['RackItems'][index]);
    for (let i = inx.length - 1; i >= 0; i--) {
      this[data][idx]['RackItems'].splice(inx[i], 1);
    }
    this.bagEblAddRckBtn.emit(rmItem);
  }

  getAllIndexes(arr, val) {
    var indexess = [], i = -1;
    while ((i = arr.indexOf(val, i + 1)) != -1) {
      indexess.push(i);
    }
    return indexess;
  }

  noReturnPredicate(item: CdkDrag<any[]>) {
    return true;
  }

  swap(event: any, idx: number, item: any, i: number, no?: number) {
    event.stopPropagation();
    const txt = no ? `swapArray${no}` : `swapArray`;
    this[txt] = [];
    this[txt].push(idx);
    this.selectedItem = {};
    this.selectedItem = item;
    this.indexNo = i;
    this.idxNo = idx;
  }

  toggleSwap(index: number, idx: number, item: any, data: string) {
    this[data][this.idxNo]['RackItems'].splice(this.indexNo, 1, item);
    this[data][idx]['RackItems'].splice(index, 1, this.selectedItem);
    this.swapArrayIndex(data);
  }
  swapArrayIndex(data) {
    const txt = data === 'filteredDatas1' ? 'swapArray1' : 'swapArray';
    this[txt] = [];
    this[data].forEach((value, index) => {
      this[txt].push(index);
    });
  }

  addContainer(idx: number, data: string) {
    if (((this.maxItmPerRow === undefined || this.maxItmPerRow === '' || this.maxItmPerRow === null) && this.addRackItem && this.addRackItem['PRESENTATION_TYPE'] === 'Hand Stack') ||
      (this.maxItmPerRow !== undefined &&
        (this[data][idx]['RackItems'].length + this.addRackItem['PICK_FACING_QNTY']) <= this.maxItmPerRow && this.addRackItem['PRESENTATION_TYPE'] === 'Hand Stack')
        ) {
            for(let i = 0; i < this.addRackItem['PICK_FACING_QNTY']; i++) {	
              this[data][idx]['RackItems'].push(this.addRackItem);	
            }
      this.ctrAdded.emit();
      this.addRackItem = null;
      this.bagCallPrtData.emit();
    } else {
      this.toastr.error(this.determineCause(idx, data));
    }
  }

  determineCause = (idx, data) => {
    let msg = '';

    if (typeof this.addRackItem === 'undefined' || (Object.keys(this.addRackItem).length === 0 && this.addRackItem.constructor === Object)){
      msg = 'No Item selected.';
      return msg;
    }

    if ((this[data][idx]['RackItems'].length + this.addRackItem['PICK_FACING_QNTY']) > this.maxItmPerRow) {
      msg = `Item can't be added to this placement, Items per Placement exceeded.`;
      return msg;
    }
  }

  addKeyForReqFrame() {
    this.addProp(this.filteredDatas, 'filteredDatas', 'LEFT');
    this.addProp(this.filteredDatas1, 'filteredDatas1', 'RIGHT'); 
  }
  addProp(items: any, name: string, plcside: string) {
    let fd = JSON.parse(JSON.stringify(items));
    fd.forEach((data, idx) => {
      data.RackItems.forEach((itm, index) => {
        if (typeof itm.IP_STORAGE_UNIT_SID === "undefined") {
          itm.IP_STORAGE_UNIT_SID = 0;
        }
        itm.PLCMNT_LEVEL = idx + 1;
        itm.DISPLAY_ORDER = index + 1;
        itm.PLCMNT_SIDE = plcside;
      });
    });
    this[name] = fd;
  }


}
