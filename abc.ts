import {ChangeDetectorRef, TemplateRef, ViewChild} from "@angular/core";
import {AgGridAngular} from "ag-grid-angular";
import {ColDef, GridOptions} from "ag-grid-community";
import {GlobalConstants, ITab} from "@core/constant/global-constants";
import {FormGroup} from "@angular/forms";
import {APIService} from "@core/api/api.service";
import {MatTabChangeEvent} from "@angular/material/tabs";
import { Component } from '@angular/core';

@Component({template: ''})
export abstract class TemplateMonitorComponent{

  selectedTab = 0;
  dataFetched = false;
  businessDates!: string[];

  defaultColDef: ColDef = {
    headerClass: 'fit-header',
    resizable: true,
    wrapHeaderText: true,
    autoHeaderHeight: true,
    floatingFilter: true
  }

  abstract tabs: ITab[];
  abstract filterTabs: ITab[];
  public gridOptions: GridOptions = {...GlobalConstants.gridOptions, enableBrowserTooltips: true};
  public searchForm!: FormGroup;
  abstract filters: any[];

  constructor(public api: APIService, public cdr: ChangeDetectorRef) {
  }

  abstract initForm(): void

  tabChanged(event: MatTabChangeEvent) {
    this.selectedTab = event.index;
    if (event.index === 0) {
      const businessDate = this.searchForm.value.businessDate;
      this.initForm();
      this.searchForm.controls['businessDate'].setValue(businessDate);
    } else if (event.index + 1 < this.tabs.length) {
      for (let i = event.index + 2; i < this.tabs.length; i++) {
        this.searchForm.controls[this.filters[i].key].setValue(null);
      }
    }
    this.tabs.splice(event.index + 1, this.tabs.length + 1);
    this.applySftFilter();
  }

  applySftFilter() {
    const tab = this.filterTabs[this.selectedTab];
    this.searchForm.controls['sftLevel'].setValue(tab.sftLevel);
    return tab;
  }

  mycellClicked(field: string, value: string) {
    if (this.tabs.length === this.selectedTab + 1) {
      this.tabs.push(this.filterTabs[this.selectedTab + 1]);
      this.selectedTab += 1;
      const formControlKey = this.filters.find((f) => f.field === field)?.key as string;
      this.searchForm.controls[formControlKey].setValue(value);
      const tab = this.applySftFilter();
      this.search(tab.field);
    }
  }

  abstract search(field: string): void

  export(exportType = 'csv') {
    this.api.downloadFile(this.searchForm.value, this.tabs[this.selectedTab].file, exportType);
  }

}
