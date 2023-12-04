import {GlobalConstants} from '@core/constant/global-constants';
import {Component, OnInit} from '@angular/core';
import {Observable, of} from 'rxjs';
import {UsageResponse} from '@core/api/models';
import {TemplateUsageComponent} from "../../templates/template-usage.component";

@Component({
  selector: 'app-usage',
  templateUrl: './usage.component.html',
  styleUrls: ['./usage.component.scss']
})
export class UsageComponent extends TemplateUsageComponent implements OnInit {

  override search = {initCall: true, entity: 'INSTITUTIONAL', cob: '19000101'};
  override businessDates!: Observable<string[]>;

  toolTipInfo = [
    {text: 'Usage >= 100%, color will be', color: 'red',},
    {text: 'Usage 90-99%, color will be', color: 'yellow'},
    {text: 'Usage 75-89%, color will be', color: 'orange'},
    {text: 'Usage &lt;75%, there will be no color', color: ''}
  ]

  override refresh(init = false) {
    this.spinner.show();
    this.api.getUsages(this.search).subscribe((v: UsageResponse) => {
      this.rowData = of(this.calculate(v.usageDataList));
      this.businessDates = of(v.businessDates);
      this.search.cob = init && v.businessDates ? v.businessDates[0] : this.search.cob;
      this.spinner.hide();
    });
  }


  override calculate(usageDataList: any[]) {

    const usageList = usageDataList.map((usageData: any) => {
      let notionalUsagePercentage = 0;
      let cpfeUsagePercentage = 0;

      if (usageData.notionalLimit != 0) {
        notionalUsagePercentage = (usageData.notionalAmount / usageData.notionalLimit) * 100;
      } else if (usageData.notionalAmount > 0) {
        // since limit is 0 this falls in the category of greater than 100%
        notionalUsagePercentage = 101;
      }

      if (usageData.cpfeLimit != 0) {
        cpfeUsagePercentage = (usageData.cpfeAmount / usageData.cpfeLimit) * 100;
      } else if (usageData.cpfeAmount > 0) {
        // since limit is 0 this falls in the category of greater than 100%
        cpfeUsagePercentage = 101;
      }

      // if usage is greater than equal to 100% then row color is red
      if (notionalUsagePercentage >= GlobalConstants.RED_BEGIN_LIMIT || cpfeUsagePercentage >= GlobalConstants.RED_BEGIN_LIMIT) {
        usageData.colorCode = GlobalConstants.COLOR_CODE_RED;
      }
      // if usage is 90-99% then row color is yellow
      else if ((notionalUsagePercentage >= GlobalConstants.YELLOW_BEGIN_LIMIT && notionalUsagePercentage < GlobalConstants.RED_BEGIN_LIMIT) ||
        (cpfeUsagePercentage >= GlobalConstants.YELLOW_BEGIN_LIMIT && cpfeUsagePercentage < GlobalConstants.RED_BEGIN_LIMIT)) {
        usageData.colorCode = GlobalConstants.COLOR_CODE_YELLOW;
      }
      // if usage is 75-89% then row color is orange
      else if ((notionalUsagePercentage >= GlobalConstants.ORANGE_BEGIN_LIMIT && notionalUsagePercentage < GlobalConstants.YELLOW_BEGIN_LIMIT) ||
        (cpfeUsagePercentage >= GlobalConstants.ORANGE_BEGIN_LIMIT && cpfeUsagePercentage < GlobalConstants.YELLOW_BEGIN_LIMIT)) {
        usageData.colorCode = GlobalConstants.COLOR_CODE_ORANGE;
      }
      // usage is < 75% - no color
      else {
        usageData.colorCode = GlobalConstants.COLOR_CODE_DEFAULT;
      }

      // set the max(cpfe usage %, notional usage %)
      if (notionalUsagePercentage > cpfeUsagePercentage) {
        usageData.usagePercentageForSorting = notionalUsagePercentage;
      } else {
        usageData.usagePercentageForSorting = cpfeUsagePercentage;
      }

      // divide to 1000 scale
      usageData.notionalLimit = this.numberWithCommas(usageData.notionalLimit) //Math.round(usageData.notionalLimit*1000)/1000;
      usageData.notionalAmount = this.numberWithCommas(usageData.notionalAmount) // Math.round(usageData.notionalAmount*1000)/1000;
      usageData.notionalExcess = Math.round(usageData.notionalExcess * 1000) / 1000;
      usageData.cpfeLimit = usageData.notionalAmount //Math.round(usageData.cpfeLimit*1000)/1000;
      usageData.cpfeAmount = Math.round(usageData.cpfeAmount * 1000) / 1000;
      usageData.cpfeExcess = Math.round(usageData.cpfeExcess * 1000) / 1000;
      return usageData;
    });
    // return usageList;
    usageList.sort((x, y) => {
      const getCode = (v: any) =>
        v.colorCode === GlobalConstants.COLOR_CODE_RED ? 3 :
          v.colorCode === GlobalConstants.COLOR_CODE_YELLOW ? 2 :
            v.colorCode === GlobalConstants.COLOR_CODE_ORANGE ? 1 : 0;
      return getCode(x) - getCode(y);
    });
    return usageList.reverse();
  }

}
