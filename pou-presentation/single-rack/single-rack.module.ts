import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './../../../shared/shared.module';
import { SingleRackComponent } from './single-rack.component';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InplaceModule } from 'primeng/inplace';
import { TooltipModule } from 'primeng/tooltip';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PartsGridComponent } from './parts-grid/parts-grid.component';
import { ItemsGridComponent } from './items-grid/items-grid.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { DragItemComponent } from './drag-item/drag-item.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BagRackComponent } from './bag-rack/bag-rack.component';
import { SvgSingleRackComponent } from './svg-single-rack/svg-single-rack.component';
import { HoseReelComponent } from './hose-reel/hose-reel.component';
import { SingleRackService } from './single-rack.service';
import { HoseRackComponent } from './hose-rack/hose-rack.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    TableModule,
    DragDropModule,
    ConfirmDialogModule,
    DialogModule,
    OverlayPanelModule,
    InplaceModule,
    TooltipModule
  ],
  declarations: [SingleRackComponent, PartsGridComponent, DragItemComponent, BagRackComponent, SvgSingleRackComponent, HoseReelComponent, ItemsGridComponent, HoseRackComponent],
  exports: [SingleRackComponent, PartsGridComponent],
  providers: [ConfirmationService, SingleRackService]
})

export class SingleRackModule {
  constructor() {

  }
}
