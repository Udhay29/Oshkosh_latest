import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { DirectivesModule } from 'src/app/shared/directives/directives.module';
import { RackBuilderComponent } from './rack-builder/rack-builder.component';

import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { RackVisualizationComponent } from './rack-visualization/rack-visualization.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    DirectivesModule,
    CheckboxModule,
    TableModule,
    DialogModule,
    TooltipModule
  ],
  declarations: [RackBuilderComponent, RackVisualizationComponent]
})
export class RackBuilderModule { }
