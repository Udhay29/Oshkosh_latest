import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import * as constants from './constants';
import { of, Subject } from 'rxjs';
import * as singleRackConstants from './single-rack/single-rack-constants';

@Injectable({
  providedIn: 'root'
})
export class PouSingleRackService {
  private baseUrl: string = environment.api;

  gridSearchData: any = [{}];
  editAccess = false;
  tabClickSub = new Subject();

  constructor(public http: HttpClient, private toastr: ToastrService) { }

  getTabClickSub = () => this.tabClickSub;

  workInsight(fId: any, wcId: any) {
    // return this.http.post(`http://entpfepd01/PFEPService/api/POUSingleRack/GetWorkCenterInsights?facilityId=${fId}&workCenterId=${wcId}`);
    return of({
      "WorkCenterInsights": {
        "TotalContainerSpace": 0.0000,
        "TotalAvailableShelfSpace": 12.3000,
        "TotalWorkCenterFootprint": 11.0000,
        "MissingItemPlans": 25
      },
      "StatusType": "SUCCESS",
      "Message": null
    })
  }

  getUniqueItemKey = rowData => rowData['ITEM_ID'] + '' + rowData['ITEM_PLAN_ID'];

  onSaveData(data: any) {
    return this.http.post(`${this.baseUrl}POUSingleRack/SaveItemsInWorkCenterRack`, data);
  }
  getRackDetails(data: any) {
    return this.http.get(`${this.baseUrl}POUSingleRack/GetWorkCenterRackDetail?workCenterRackSID=${data}`);
  }
  getRackList(data: any) {
    return this.http.post(`${this.baseUrl}POUSingleRack/GetWorkCenterRackList`, data);
  }

  removeRack(ids: any) {
    return this.http.post(`${this.baseUrl}POUSingleRack/RemoveWorkCenterRack`, ids);
  }

  createRack(selRack: any) {
    console.log('service', selRack);
    return this.http.post(`${this.baseUrl}POUSingleRack/CreateWorkCenterRack`, selRack);
  }

  getmasterRackDetails(fId: any) {
    return this.http.get(`${this.baseUrl}POUSingleRack/GetMasterRacks?facilityId=${fId}`);
  }

  saveNotes = rackData => {
    const postData = {
      "WorkCenterRack": [
        {
          [singleRackConstants.rackSID]: rackData[singleRackConstants.rackSID],
          [singleRackConstants.rackID]: rackData[singleRackConstants.rackID],
          [singleRackConstants.notesKey]: rackData[singleRackConstants.notesKey]
        }
      ]
    }

    return this.http.post(`${this.baseUrl}POUSingleRack/UpdateWorkCenterRack`, postData);
  }

  pouPresentationSearch(data: any) {
    return this.http.post(`${this.baseUrl}POUSingleRack/GetSingleRackSearchResult`, data);
  }

  setEditAccess = editAccess => {
    this.editAccess = editAccess;
  }
  getEditAccess = () => this.editAccess;
  transformDate(date, joiningChar, format) {
    const d = new Date(date);
    return format === 'MMDDYYYY'
      ? [d.getMonth() + 1, d.getDate(), d.getFullYear()].join(joiningChar)
      : [d.getFullYear(), d.getMonth() + 1, d.getDate()].join(joiningChar);
  }

  onSearchGridDataWithWorkCenter(workCenterId) {
    // this.gridSearchData = data.singleRackData
    // return this.gridSearchData;

    const postData = {
      [constants.workCenterId]: workCenterId,
      [constants.effectiveDate]: '',
      [constants.expireDate]: '',
      [constants.itemPlanStatusKey]: ''
    };
    return this.http.post(
      `${this.baseUrl}POUSingleRack/GetSearchList`,
      postData,
      { observe: 'response' }
    );
  }

  getRowUpdate = postData => {
    return this.http.post(
      `${this.baseUrl}ItemPlanDetail/GetSingleRackRecordDetails`,
      postData,
      { observe: 'response' }
    );
  }

  getItemPlanStatus() {
    return this.http.get(`${this.baseUrl}POUSingleRack/GetItemPlanStatus`);
  }

  searchUsingItemPlanStatus(workCenterId, archiveStatus, fromDate, toDate) {
    const postData = {
      [constants.workCenterId]: workCenterId ? workCenterId : '',
      [constants.effectiveDate]: fromDate
        ? this.transformDate(fromDate, '-', '')
        : '',
      [constants.expireDate]: toDate ? this.transformDate(toDate, '-', '') : '',
      [constants.itemPlanStatusKey]: archiveStatus === true ? 'Archived' : ''
    };
    return this.http.post(
      `${this.baseUrl}POUSingleRack/GetArchivedPlanStatus`,
      postData
    );
  }

  saveEditedGridData = postData =>
    this.http.post(
      `${this.baseUrl}POUSingleRack/SaveSingleRackDetails`,
      postData,
      { observe: 'response' }
    )

  displayMessage = (type, message) => {
    type === 'danger'
      ? this.toastr.error(message)
      : this.toastr.success(message, '', { disableTimeOut: false });
  }

  onLoadDataFromItemFlow = postData =>
    this.http.post(
      `${this.baseUrl}POUSingleRack/GetSingleRackItemFlowList`,
      postData
    )

  fetchExecuteCtrValues = postData =>
    this.http.post(
      `${this.baseUrl}POUSingleRack/GetExecuteContainerSelection`,
      postData,
      { observe: 'response' }
    )


  // copy plans api
  orgId = JSON.parse(localStorage.getItem('currentUser')).org_id;

  getAllDDValues = branch => {

    return this.http.get(`${this.baseUrl}/POUSingleRack/GetCopyDetailDropdown?orgId=${this.orgId}&facilityId=${branch}`);
    //return constants.allDDValues;
  }


  getFacilities = () => {
    return this.http.get(`${this.baseUrl}Common/GetFacilityList?orgId=${this.orgId}&facilityId=null`);
    // return constants.facilties;
  }

  getWorkCenterList = (branch) => {
    return this.http.get(`${this.baseUrl}Common/GetWorkCenterList?orgId=${this.orgId}&facilityId=${branch}&workcenterId=null`);
    // return constants.workCenters;
  }

  getSupplierLocationList = () => {
    return this.http.get(`${this.baseUrl}Common/GetSupplyingLocationList?orgId=${this.orgId}&supplierId=null`);
    // return constants.supplierLocationList;
  }

  getMFPList = (branch) => {
    return this.http.get(`${this.baseUrl}Common/GetMaterialFlowPlans?orgId=${this.orgId}&facilityId=${branch}&mtrlFlowPlanId=null`);
    // return constants.MFPList;
  }

  copyItemPlans = postData => {
    return this.http.post(`${this.baseUrl}POUSingleRack/CopyItemPlans`, postData);
    // return constants.copyPlansMock;
  }

  getPresentationTypeValues = () => {
    return this.http.get(
      `${this.baseUrl}ItemPlanDetail/GetDropdownList?Value=PRESENTATION_TYPE`, { observe: 'response' }
    );
  }
}
