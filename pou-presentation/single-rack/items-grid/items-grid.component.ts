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
import { PouSingleRackService } from '../../pou-single-rack.service';
import * as constants from '../../constants';
import { SharedService } from '../../../../shared/services/share.service';
import * as singleRackConstants from '../single-rack-constants';
import { WebWorkerService } from 'ngx-web-worker';

@Component({
  selector: 'pfep-items-grid',
  templateUrl: './items-grid.component.html',
  styleUrls: ['./items-grid.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [WebWorkerService]
})
export class ItemsGridComponent implements OnInit {
  filteredData: Array<object> = [];
  selectedRow: any[];
  getRowIndex: any[];
  validationIndex: number[];
  onloadSvgID: any;
  partsSelectedData: any;
  allowedCtrTypes = singleRackConstants.allowedCtrType
  filters = constants.itemsGridFilters;
  constructor(
    public pouSingleRackService: PouSingleRackService,
    public sharedService: SharedService,
    public elref: ElementRef,
    private _webWorkerService: WebWorkerService
  ) {
    this.selectedRow = [];
    this.getRowIndex = [];
    this.validationIndex = [];
  }
  sortField: string = '';
  appliedFilters: object = {};
  isFilterApplied: boolean = false;
  applicableToRack = 'applicableToRack'

  @Input() tableFields: any;
  @Input() gridData: Array<object>;
  @Input() wcPart: String;
  @Input() wcRack: String;
  @Input() wcMasterRack: String;
  @Input() partsGridDatas: any;
  @Input() selectedRackType: string = '';
  @Input() itemsAddedtoRack: any = {};
  @Input() dropDownValues: any = {};
  @Input() loading = false;
  @Input() itemDetailFn: Function;
  @Input() selectedRackId: any;
  @Output('parentFun') parentFun: EventEmitter<any> = new EventEmitter();
  @Output('parentFunforgetRack') parentFunforgetRack: EventEmitter<any> = new EventEmitter();
  @Output() addToRack: EventEmitter<any> = new EventEmitter();
  @Output() initLoadSID: EventEmitter<any> = new EventEmitter();

  ngOnChanges(changes) {
    if (changes && changes.gridData && changes.gridData.currentValue) {
      this.filteredData = [...changes.gridData.currentValue];
      this.resetSortAndFilter();
      this.sortTableAccToRelevance();
    }
    this.selectedRow = [];
  }
  ngOnInit() {
    this.filteredData = [...this.gridData];
    this.resetSortAndFilter();
    this.sortTableAccToRelevance();
  }

  resetSortAndFilter = () => {
    this.appliedFilters = {};
    this.sortField = '';
  }

  checkAndSortToRelevance = () => {
    if (this.sortField === '' && Object.keys(this.appliedFilters).length === 0) {
      this.sortTableAccToRelevance();
    }
  }

  sortTableAccToRelevance = () => {
    this.filteredData = [...this.filteredData].sort((a, b) => {
      const aRelevant = !this.disableAddBtn(a);
      const bRelevant = !this.disableAddBtn(b);

      if ((aRelevant && bRelevant) || (!aRelevant && !bRelevant)) {
        return a[constants.itemId] - b[constants.itemId];
      }
      if (aRelevant && !bRelevant) {
        return -1;
      }
      if (!aRelevant && bRelevant) {
        return 1;
      }
    })
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
    if (this.itemsAddedtoRack[this.pouSingleRackService.getUniqueItemKey(rowData)] || (!this.itemsAddedtoRack[this.pouSingleRackService.getUniqueItemKey(rowData)] && this.selectedRackId !== undefined && rowData['WC_STORAGE_UNIT_ID'] !== null && rowData['WC_STORAGE_UNIT_ID'] !== this.selectedRackId.WorkCenterRack.WC_STORAGE_UNIT_ID ) || (this.selectedRackId !== undefined && rowData['WC_STORAGE_UNIT_ID'] !== null && rowData['WC_STORAGE_UNIT_ID'] !== this.selectedRackId.WorkCenterRack.WC_STORAGE_UNIT_ID  ) || (!this.selectedRackType || (this.allowedCtrTypes[this.selectedRackType].indexOf(rowData['PRESENTATION_TYPE']) === -1))) {
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

  onSort = (field, e) => {
    e.stopPropagation();
    this.loading = true;

    this.sortField = field;
    const message = {
      type: 'sort',
      dataArr: [...this.filteredData],
      field,
      sortMode: this.sortField
    };
    this.invokeWorker(message);
  }

  filterApplied = (value, field, type, key) => {
    this.loading = true;
    if (value === 'null') { value = null; }
    switch (type) {
      case 'number':
        value = Number(value);
      case 'decimal':
        value = parseFloat(value);
    }
    this.validateFilters(value, field);
    this.filterFn();
  }

  validateFilters = (value, field) => {
    value
      ? (this.appliedFilters[field] = value)
      : delete this.appliedFilters[field];
  }

  filterFn = () => {
    const message = {
      type: 'filterSearch',
      dataArr: [...this.gridData],
      filters: this.appliedFilters
    };
    this.invokeWorker(message);
  }

  invokeWorker = message => {
    const promise =
      message.type === 'filterSearch'
        ? this._webWorkerService.run(this.filterGrid, message)
        : this._webWorkerService.run(this.sortGrid, message);
    promise.then(res => {
      this.updateDataWithSearch([...res]);
    });
  }

  updateDataWithSearch = data => {
    this.filteredData = [...data];
    this.loading = false;
  }

  debounce = (func, timeOut) => {
    let delay;
    return (...rest) => {
      const context = this;
      const later = () => {
        delay = null;
        func.apply(context, rest);
      };
      clearTimeout(delay);
      delay = setTimeout(later, timeOut);
    };
  }

  debounceFilter = this.debounce(this.filterApplied, 1000);

  filterGrid = input => {

    const { dataArr, filters } = input;
    let filteredData = [...dataArr];
    if (Object.keys(filters).length > 0) {
      filteredData = [...dataArr].filter(rec => {
        let isValid = true;
        Object.keys(filters).forEach(attr => {
          if (isValid) {
            isValid = rec[attr] ? rec[attr].toString().indexOf(filters[attr]) > -1 : false;
          }
        });
        return isValid;
      });
    }

    return [...filteredData];
  }

  sortGrid = input => {
    const { dataArr, field, sortMode, type } = input;
    const dataToSort = [...dataArr];
    dataToSort.sort((a, b) => {
      return sortMode === 1 ? a[field] - b[field] : b[field] - a[field];
    });

    return [...dataToSort];
  }

}
