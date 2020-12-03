import * as constants from './rack-builder-constants';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';

@Injectable({
    providedIn: 'root'
})

export class RackBuilderService {
    private baseUrl: string = environment.api;

    gridSearchData: any = [{}];
    editAccess = false;

    constructor(public http: HttpClient, private toastr: ToastrService) { }

    setEditAccess = editAccess => {
        this.editAccess = editAccess;
    }
    getEditAccess = () => this.editAccess;

    getRackDetails = postData => {
        return this.http.post(`${this.baseUrl}RackBuilder/GetRackBuilderDetail`, postData);
    }

    getAssignmentTblDetails = postData => {
        return this.http.post(`${this.baseUrl}RackBuilder/GetBranchDetailsBySegments`, postData)
    }

    getRackTypeDDValues = () => {
        return this.http.get(`${this.baseUrl}Common/GetDropDownValues?type=Storage Unit Type&value=`);
    }
    getUOMDDValues = () => {
        return this.http.get(`${this.baseUrl}Common/GetDropDownValues?type=Unit Dim UOM&value=`);
    }
    getRollersDDValues = () => {
        return this.http.get(`${this.baseUrl}Common/GetDropDownValues?type=Roller&value=`);
    }

    checkForRackNameValidity = (string, rackType) => {
        return this.http.get(`${this.baseUrl}RackBuilder/IsMasterRackIdExist?masterRackId=${string}&rackType=${rackType} `)
    }

    saveDetails = postData => {
        return this.http.post(`${this.baseUrl}RackBuilder/SaveRackBuilderDetail`, postData);
    }

    displayMessage = (type, message) => {
        type === 'error'
            ? this.toastr.error(message)
            : this.toastr[type](message, '', { disableTimeOut: false });
    }
}