import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
    BASE_URL = 'http://localhost:3000';
    // MatPaginator Inputs
    paginationInfo;
    pageSizeOptions: number[] = [5, 10, 25, 100];

    // states
    tableData;
    constructor(private httpClient: HttpClient) {
      this.getPageDetails();
    }
    setPageSizeOptions = (setPageSizeOptionsInput: string) => {
      if (setPageSizeOptionsInput) {
        this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
      }
    }

    ngOnInit(): void {
      // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
      // Add 'implements OnInit' to the class.
      this.getPageDetails();
     // this.getPageDetails();
    }

    onPageEvent = ($event) => {
      this.getData($event.pageIndex, $event.pageSize);
    }

    getPageDetails = () => {
      this.getPageSize().subscribe( res => {
        this.paginationInfo = res;
        this.getData(0, this.paginationInfo.pageSize);
      });
    }

    getData = (pg, lmt) => {
      return this.allProjects(pg, lmt).subscribe( res => {
        this.tableData = res;
      });
    }

    allProjects = (page, limit) => {
      return this.httpClient.get(`${this.BASE_URL}/posts?_page=${page + 1}&_limit=${limit}`);
    }

    getPageSize = () => {
      return this.httpClient.get(`${this.BASE_URL}/pageSize`);
    }
}
