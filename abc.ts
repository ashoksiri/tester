import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {CapitalmarketsResp} from '@core/api/models';
import {GlobalConstants, ITab} from '@core/constant/global-constants';
import {CellClickedEvent, ColDef} from 'ag-grid-community';
import {isNumber, omit,} from 'lodash';
import {of} from 'rxjs';
import {TemplateMonitorComponent} from "../../templates/template-monitor.component";

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html'
})
export class MonitorComponent extends TemplateMonitorComponent implements OnInit {

  public data = {input: '', date: ''};
  tabs: ITab[] = [GlobalConstants.capitaltabs[0]]
  filterTabs: ITab[] = GlobalConstants.capitaltabs;
  autoFillOptions: string[];

  filters = [
    {key: 'facilityID', field: 'facilityID', header: 'Facility',},
    {key: 'businessDate', field: 'businessDate', header: 'Business Date',},
    {key: 'brokerCID', field: 'brokerCID', header: 'Broker CID',},
    {key: 'businessLine', field: 'business', header: 'Business',},
    {key: 'nettingSetId', field: 'nettingSet', header: 'Netting Set',}
  ];

  ngOnInit() {
    this.initForm();
    this.search();

  }

  search(field = 'facilityID', initCall = true) {
    const cellOptions: ColDef = {
      onCellClicked: (event: CellClickedEvent) => {
        this.mycellClicked(event.colDef.field as string, event.value)
      },
      cellStyle: {cursor: 'pointer', textDecoration: 'underline', color: '#9b8c36'}
    }
    const columnDefs = GlobalConstants.capitalMarketsMonitorColumnDefs.map((col: ColDef) => col.field === field ? ({...col, ...cellOptions}) : col);
    this.tabs[this.selectedTab].columnDefs = columnDefs;

    const payload = this.getPayload();
    this.api.getCapitalMarkets(payload).subscribe((v: CapitalmarketsResp) => {
      this.tabs[this.selectedTab].rowData$ = of(v.cpfePershingDataLst);
      this.businessDates = v.businessDates;
      this.autoFillOptions = v.brokerNames;
      if (initCall) {
        this.data.date = this.businessDates[0];
      }
      this.dataFetched = true;
    });

  }

  initForm() {
    this.searchForm = new FormGroup({
      input: new FormControl(),
      facilityID: new FormControl(),
      businessDate: new FormControl(),
      brokerCID: new FormControl(),
      brokerName: new FormControl(),
      businessLine: new FormControl(),
      nettingSetId: new FormControl(),
      sftLevel: new FormControl(),
      entity: new FormControl('CAPITALMARKETS')
    });
  }

  private getPayload() {
    const payload = omit(this.searchForm.value, 'input');
    if (this.data.input.length === 7 && isNumber(this.data.input)) {
      payload.facilityID = this.data.input
    } else if (this.data.input.length === 10 && isNumber(this.data.input)) {
      payload.brokerCID = this.data.input;
    } else {
      payload.brokerName = this.data.input;
    }
    return payload;
  }

}
