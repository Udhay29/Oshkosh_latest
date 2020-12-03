import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SingleRackService {

  constructor() { }

  addWidthKey(data1) {
    data1.forEach(data => {
      data['RackItems'].forEach(data2 => {
        if(data2.PRESENTATION_TYPE === 'Hand Stack') {
          data2.width = data2.HANDSTACK_SPACE_WIDTH;
          data2.height = data2.HANDSTACK_SPACE_HEIGHT;
          // data2.width = 5;
          // data2.height = 5;
          data2.IS_EMPTY_ITEM_PLCMNT = false;
        } else {
          switch (true) {
            case data2.CONTAINER_ORIENTATION === null && data2.PRIMARY_ORIENTATION_LORW !== null:
              const width = data2.PRIMARY_ORIENTATION_LORW === 'W' ? data2.CONTAINER_OUT_WIDTH : data2.CONTAINER_OUT_LENGHT;
              data2.width = width;
              data2.height = data2.CONTAINER_OUT_HEIGHT;
              data2.IS_EMPTY_ITEM_PLCMNT = false;
              break;
            case data2.CONTAINER_ORIENTATION !== null && data2.PRIMARY_ORIENTATION_LORW === null:
              const width1 = data2.CONTAINER_ORIENTATION === 'W' ? data2.ITEM_WIDTH : data2.ITEM_LENGTH;
              data2.width = width1;
              data2.height = data2.ITEM_HEIGHT;
              data2.IS_EMPTY_ITEM_PLCMNT = false;
              break;
            case data2.CONTAINER_ORIENTATION === null && data2.PRIMARY_ORIENTATION_LORW === null:
              data2.width = null;
              data2.height = null;
              data2.IS_EMPTY_ITEM_PLCMNT = true;
              break;
            case data2.CONTAINER_ORIENTATION !== null && data2.PRIMARY_ORIENTATION_LORW !== null:
              const width2 = data2.CONTAINER_ORIENTATION === 'W' ? this.takeLOrW(data2, 'ITEM_WIDTH', 'CONTAINER_OUT_WIDTH') :
                this.takeLOrW(data2, 'ITEM_LENGTH', 'CONTAINER_OUT_LENGHT');
              data2.width = width2;
              data2.height = data2.ITEM_HEIGHT ? data2.ITEM_HEIGHT : data2.CONTAINER_OUT_HEIGHT;
              data2.IS_EMPTY_ITEM_PLCMNT = false;
          }
        }
        
      });
    });
    // return data1;
  }

  addWidthKeyHandStack(data){
    
    data.forEach(data2 => {
      if(data2.PRESENTATION_TYPE === 'Hand Stack') {
        data2.width = data2.HANDSTACK_SPACE_WIDTH;
        data2.height = data2.HANDSTACK_SPACE_HEIGHT;
        // data2.width = 5;
        // data2.height = 5;
        data2.IS_EMPTY_ITEM_PLCMNT = false;
      }
    });
  }

  takeLOrW(data: any, value1: string, value2: string) {
    return data[value1] !== null ? data[value1] : data[value2];
  }
}
