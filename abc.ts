import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ColDef, GridOptions} from "ag-grid-community";
import {CommonModule} from "@angular/common";
import {SharedModule} from "@shared";
import {Observable} from "rxjs";
import {AgGridAngular} from "ag-grid-angular";

@Component({
  selector: 'app-template-grid',
  standalone: true,
  imports: [
    CommonModule, SharedModule
  ],
  template: `
    <div class="flex justify-between w-full pt-2 py-1">
      <div class="w-2/6">
        <mat-form-field appearance="outline" class="dense-3 w-full">
          <mat-label>Search Table:-</mat-label>
          <input id="filter-text-box" matInput (input)="onFilterTextBoxChanged()">
        </mat-form-field>
      </div>
      <div class="flex justify-around">
        <app-svg-icon icon="excel" [height]="35" [width]="35" (click)="exportOut('xls')"></app-svg-icon>
        <app-svg-icon icon="pdf" [height]="35" [width]="35" (click)="exportOut('pdf')"></app-svg-icon>
        <app-svg-icon [height]="35" [width]="35" (click)="exportOut('csv')"></app-svg-icon>
      </div>
    </div>
    <div style="height:fit-content">
      <ag-grid-angular class="ag-theme-alpine" style="width: 100%; height: 70%;" [rowData]="rowData | async"
                       [columnDefs]="columnDefs" [gridOptions]="gridOptions" [defaultColDef]="defaultColDef">
      </ag-grid-angular>
    </div>
  `,
})
export class TemplateGridComponent {

  @ViewChild(AgGridAngular)
  agGrid!: AgGridAngular;

  @Input({required: true})
  gridOptions: GridOptions;

  @Input({required: true})
  defaultColDef: ColDef;

  @Input({required: true})
  columnDefs: ColDef[] | undefined

  @Input({required: true})
  rowData: Observable<any[]> | undefined

  @Output()
  export = new EventEmitter<string>();

  @Output()
  filterChanged = new EventEmitter();

  exportOut(format: string) {
    this.export.emit(format);
  }

  onFilterTextBoxChanged() {
    this.agGrid.api.setQuickFilter(
      (document.getElementById('filter-text-box') as HTMLInputElement).value
    );
  }
}
