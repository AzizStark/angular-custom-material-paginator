import { Component, OnInit } from '@angular/core';
import {PageEvent} from '@angular/material/paginator';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
    BASE_URL = 'http://localhost:3000';
    // MatPaginator Inputs
    length = 100;
    pageSize = 10;
    pageSizeOptions: number[] = [5, 10, 25, 100];

    // states
    tableData;
    constructor(private httpClient: HttpClient) {}
    setPageSizeOptions = (setPageSizeOptionsInput: string) => {
      if (setPageSizeOptionsInput) {
        this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
      }
    }

    ngOnInit(): void {
      // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
      // Add 'implements OnInit' to the class.
      this.getData(0, 10);
    }

    onPageEvent = ($event) => {
      this.getData($event.pageIndex, $event.pageSize);
    }

    getData = (pg, lmt) => {
      return this.allProjects(pg, lmt).subscribe( res => {
        this.tableData = res;
      });
    }

    allProjects = (page, limit) => {
      return this.httpClient.get(`${this.BASE_URL}/posts?_page=${page + 1}&_limit=${limit}`);
    }
}
