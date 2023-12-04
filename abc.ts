import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {GlobalConstants, ITab} from '@core/constant/global-constants';
import {TemplateMonitorComponent} from "../../templates/template-monitor.component";
import {CellClickedEvent, ColDef} from "ag-grid-community";

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html'
})
export class MonitorComponent extends TemplateMonitorComponent implements OnInit {

  tabs: ITab[] = [GlobalConstants.tabs[0]]
  filterTabs: ITab[] = GlobalConstants.tabs;
  filters = [
    {key: 'facility', field: 'facility', header: 'Facility',},
    {key: 'businessDate', field: 'businessDate', header: 'Business Date',},
    {key: 'brokerCID', field: 'brokerData.broker_CID', header: 'Broker CID',},
    {key: 'businessLine', field: 'business', header: 'Business',},
    {key: 'nettingSetId', field: 'netting_Set_', header: 'Netting Set',},
    {key: 'clientCID', field: 'client_CID', header: 'Client CID',},
  ];

  initForm() {
    this.searchForm = new FormGroup({
      brokerAccountNumber: new FormControl(),
      brokerCID: new FormControl(),
      brokerName: new FormControl(),
      businessDate: new FormControl(),
      businessLine: new FormControl(),
      clientCID: new FormControl(),
      facility: new FormControl(),
      fetchingLevel: new FormControl("FACILITY"),
      nettingSetId: new FormControl(),
      sftLevel: new FormControl("FL"),
    });
    this.searchForm.controls['businessDate'].setValue(this.businessDates[0]);
  }

  ngOnInit(): void {
    this.api.businessDates$.subscribe((dates) => {
      this.businessDates = dates;
      this.initForm();
    });
  }

  search(field = 'facility') {
    console.log(1);
    const cellOptions: ColDef = {
      onCellClicked: (event: CellClickedEvent) => {
        this.mycellClicked(event.colDef.field as string, event.value)
      },
      cellStyle: {cursor: 'pointer', textDecoration: 'underline', color: '#9b8c36'}
    }
    const columnDefs = GlobalConstants.institutionalHeader.map((col: ColDef) => col.field === field ? ({...col, ...cellOptions}) : col);
    this.tabs[this.selectedTab].columnDefs = columnDefs;
    this.tabs[this.selectedTab].rowData$ = this.api.getFacilities(this.searchForm.value);
    this.dataFetched = true;
  }

}
