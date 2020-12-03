import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PouPresentationRoutingModule } from './pou-presentation-routing.module';
import { PouPresentationComponent } from './pou-presentation.component';
import {SharedModule} from '../../shared/shared.module';
import { CalendarModule } from 'primeng/calendar';
import {TableModule} from 'primeng/table';
import {DropdownModule} from 'primeng/dropdown';
import {InputSwitchModule} from 'primeng/inputswitch';
import {DialogModule} from 'primeng/dialog';
import { DirectivesModule } from 'src/app/shared/directives/directives.module';
import {SingleRackModule} from './single-rack/single-rack.module';
import {RackBuilderModule} from './rack-builder/rack-builder.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    PouPresentationRoutingModule,
    SharedModule,
    CalendarModule,
    TableModule,
    DropdownModule,
    InputSwitchModule,
    DialogModule,
    DirectivesModule,
    SingleRackModule,
    RackBuilderModule
  ],
  declarations: [PouPresentationComponent]
})
export class PouPresentationModule {
  constructor() {
  }
}
