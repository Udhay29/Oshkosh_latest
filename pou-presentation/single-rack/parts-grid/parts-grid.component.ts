import {
  Component,
  OnInit,
  AfterViewChecked,
  ViewEncapsulation,
  DoCheck,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  OnDestroy
} from '@angular/core';
import { PouSingleRackService } from './../../pou-single-rack.service';
import * as constants from '../../constants';
import { SharedService } from "./../../../../shared/services/share.service";
import * as singleRackConstants from '../single-rack-constants';

@Component({
  selector: 'pfep-parts-grid',
  templateUrl: './parts-grid.component.html',
  styleUrls: ['./parts-grid.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PartsGridComponent implements OnInit {
  filteredData: Array<object> = [];
  selectedRow: any[];
  getRowIndex: any[];
  validationIndex: number[];
  onloadSvgID: any;
  partsSelectedData: any;
  allowedCtrTypes = singleRackConstants.allowedCtrType
  constructor(
    public pouSingleRackService: PouSingleRackService,
    public sharedService: SharedService,
    public elref: ElementRef
  ) {
    this.selectedRow = [];
    this.getRowIndex = [];
    this.validationIndex = [];
  }

  @Input() tableFields: any;
  @Input() gridData: Array<object>;
  @Input() wcPart: String;
  @Input() wcRack: String;
  @Input() wcMasterRack: String;
  @Input() partsGridDatas: any;
  @Input() selectedRackType: string = '';
  @Input() itemsAddedtoRack: any = {};


  @Input() loading = false;

  @Input() itemDetailFn: Function;
  @Output('parentFun') parentFun: EventEmitter<any> = new EventEmitter();
  @Output('parentFunforgetRack') parentFunforgetRack: EventEmitter<any> = new EventEmitter();
  @Output() addToRack: EventEmitter<any> = new EventEmitter();
  @Output() initLoadSID: EventEmitter<any> = new EventEmitter();

  ngOnChanges(changes) {
    if (changes && changes.gridData && changes.gridData.currentValue) {
      this.filteredData = [...changes.gridData.currentValue];
    } 
    this.selectedRow = [];
  }
  ngOnInit() {
    this.filteredData = [...this.gridData];
  }
  navigateToItemPlanDetail = (e, rowData) => {
    e.preventDefault();
    this.itemDetailFn({
      itemPlanRequest: {
        planIdFromParent: rowData[constants.itemPlanId],
        parentScreenPath: '/pou/single-rack',
        isChild: true,
        selectedRecord: rowData
      }
    });
  }
  scrollToView(event, data) {
    event.stopPropagation();
    this.partsSelectedData = JSON.parse(JSON.stringify(data));
    this.parentFun.emit();
    this.sharedService.broadcast('addRckBtnData', data);
  }

  disableAddBtn = rowData => {
    if (!this.selectedRackType || (this.allowedCtrTypes[this.selectedRackType].indexOf(rowData['PRESENTATION_TYPE']) === -1)) {
      return true;
    }

    if (this.itemsAddedtoRack[this.pouSingleRackService.getUniqueItemKey(rowData)]) {
      return true;
    }
    return false;
  }

  getRackDetails(data) {
    if (data.WC_STORAGE_UNIT_SID) {
      this.parentFunforgetRack.emit({ WC_STORAGE_UNIT_SID: data.WC_STORAGE_UNIT_SID, STORAGE_UNIT_TYPE: data.STORAGE_UNIT_TYPE });
    }
  }

  omitSpecialChar(event) {
    let letters = /^[0-9a-zA-Z]+$/;
    if (event.key.match(letters)) {
      return true;
    }
    else {
      return false;
    }
  }
  onTableHeaderCheckboxToggle(event) {
    if (event.checked === false) {
      this.getRowIndex = [];
    }
  }
  onRowSelect(event) {
    // event.stopPropagation();
  }
  onRowUnselect(event) {
    // event.stopPropagation();
    const inx = this.getRowIndex.indexOf(event.data);
    this.getRowIndex.splice(inx, 1);
  }

  disableBtn = rowData => {
    return (!this.selectedRackType || (this.allowedCtrTypes[this.selectedRackType].indexOf(rowData['PRESENTATION_TYPE']) === -1));
  }

}
