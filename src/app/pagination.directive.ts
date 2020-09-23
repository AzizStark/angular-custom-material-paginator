import {
  ElementRef,
  AfterViewInit,
  Directive,
  Host,
  Optional,
  Renderer2,
  Self,
  ViewContainerRef,
  Input
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatButton } from '@angular/material/button';

interface PageObject {
  length: number;
  pageIndex: number;
  pageSize: number;
  previousPageIndex: number;
}

@Directive({
  selector: '[appPagination]'
})
export class PaginationDirective {
  private _currentPage = 1;
  private _pageGapTxt2 = '..';
  private _pageGapTxt = '...';
  private _rangeStart;
  private _rangeEnd;
  private _buttons = [];
  private _curPageObj: PageObject = {
    length: 0,
    pageIndex: 0,
    pageSize: 0,
    previousPageIndex: 0
  };

  @Input()
  get showTotalPages(): number { return this._showTotalPages; }
  set showTotalPages(value: number) {
    this._showTotalPages = value % 2 === 0 ? value + 1 : value;
  }
  private _showTotalPages = 2;

  constructor(
    @Host() @Self() @Optional() private readonly matPag: MatPaginator,
    private vr: ViewContainerRef,
    private ren: Renderer2
  ) {
    // Sub to rerender buttons when next page and last page is used
    this.matPag.page.subscribe((v) => {
      this.switchPage(v.pageIndex);
    });
  }

  private buildPageNumbers = () => {
    const actionContainer = this.vr.element.nativeElement.querySelector(
      'div.mat-paginator-range-actions'
    );
    const nextPageNode = this.vr.element.nativeElement.querySelector(
      'button.mat-paginator-navigation-next'
    );
    let prevButtonCount = this._buttons.length;

    // remove buttons before creating new ones
    if (prevButtonCount > 0) {
      this._buttons.forEach(button => {
        this.ren.removeChild(actionContainer, button);
      });
      // Empty state array
      prevButtonCount = 0;
    }
    const pagecount = this.vr.element.nativeElement.childNodes[0].childNodes[0]
      .childNodes[1].childNodes[0];
    console.log(pagecount);
    this.ren.setStyle(pagecount, 'white-space', 'nowrap');

    // 1initialize next page and last page buttons
    if (prevButtonCount === 0) {
      const nodeArray = this.vr.element.nativeElement.childNodes[0].childNodes[0]
        .childNodes[1].childNodes;

      setTimeout(() => {
        for (const node of nodeArray) {
          if (node.nodeName === 'BUTTON') {
            // Next Button styles
            if (node.innerHTML.length > 100 && node.disabled) {
              this.ren.setStyle(node, 'color', '#999999');
              this.ren.setStyle(node, 'margin', '.5%');
            } else if (
              node.innerHTML.length > 100 &&
              !node.disabled
            ) {
              this.ren.setStyle(node, 'color', '#999999');
              this.ren.setStyle(node, 'margin', '.5%');
            } else if (node.disabled) {
              this.ren.setStyle(node, 'background-color', '#007CBE');
              this.ren.setStyle(node, 'color', '#fff');
            }
          }
        }
      });
    }

    let dots = false;
    let dots2 = false;

    this.ren.insertBefore(
      actionContainer,
      this.createButton(0, this.matPag.pageIndex),
      nextPageNode
    );

    for (let i = 1; i < this.matPag.getNumberOfPages() - 1; i = i + 1) {

      if (
        (i < this._showTotalPages && this._currentPage < this._showTotalPages && i > this._rangeStart) ||
        (i >= this._rangeStart && i <= this._rangeEnd)
      ) {
        this.ren.insertBefore(
          actionContainer,
          this.createButton(i, this.matPag.pageIndex),
          nextPageNode
        );
      } else {
        if (i > this._rangeEnd && !dots) {
          this.ren.insertBefore(
            actionContainer,
            this.createButton(this._pageGapTxt, this.matPag.pageIndex),
            nextPageNode
          );
          dots = true;
        }
        if (i < this._rangeEnd && !dots2) {
          this.ren.insertBefore(
            actionContainer,
            this.createButton(this._pageGapTxt2, this.matPag.pageIndex),
            nextPageNode
          );
          dots2 = true;
        }
      }
    }

    if (this.matPag.getNumberOfPages() !== 1) {
      this.ren.insertBefore(
        actionContainer,
        this.createButton(this.matPag.getNumberOfPages() - 1, this.matPag.pageIndex),
        nextPageNode
      );
    }
  }

  private createButton(i: any, pageIndex: number): any {
    const linkBtn: MatButton = this.ren.createElement('button');
    this.ren.setStyle(linkBtn, 'border-radius', '4px');
    this.ren.setStyle(linkBtn, 'border', 'none');
    this.ren.setStyle(linkBtn, 'margin', '1%');
    this.ren.setStyle(linkBtn, 'color', '#333333');
    this.ren.setStyle(linkBtn, 'font-size', '14px');
    this.ren.setStyle(linkBtn, 'min-width', '24px');
    this.ren.setStyle(linkBtn, 'min-height', '24px');
    this.ren.setStyle(linkBtn, 'padding', 'unset');
    this.ren.setStyle(linkBtn, 'background-color', 'transparent');

    const pagingTxt = isNaN(i) ? this._pageGapTxt : +(i + 1);
    const text = this.ren.createText(pagingTxt + '');

    this.ren.addClass(linkBtn, 'mat-custom-page');
    // newIndex = this._curPageObj.pageIndex + this._showTotalPages;
    switch (i) {
      case pageIndex:
        this.ren.setAttribute(linkBtn, 'disabled', 'disabled');
        break;
      case this._pageGapTxt:
        this.ren.listen(linkBtn, 'click', () => {
          this.switchPage(this._currentPage + this._showTotalPages);
        });
        break;
      case this._pageGapTxt2:
        this.ren.listen(linkBtn, 'click', () => {
          this.switchPage(this._currentPage - this.showTotalPages);
        });
        break;
      default:
        this.ren.listen(linkBtn, 'click', () => {
          this.switchPage(i);
        });
        break;
    }

    this.ren.appendChild(linkBtn, text);
    // Add button to private array for state
    this._buttons.push(linkBtn);
    return linkBtn;
  }
  // calculates the button range based on class input parameters and based on current page index value.
  // Used to render new buttons after event.

  private initPageRange(): void {
    console.log(this._rangeStart, this._rangeEnd);
    this._rangeStart = this._currentPage - this._showTotalPages / 2;
    this._rangeEnd = this._currentPage + this._showTotalPages / 2;
    console.log(this._rangeStart, this._rangeEnd);
    this.buildPageNumbers();
  }

  private switchPage(i: number): void {
    this._currentPage = i;
    this.matPag.pageIndex = i;
    this.initPageRange();
  }

  // Initialize default state after view init
  public ngAfterViewInit() {
    this._rangeStart = 0;
    this._rangeEnd = this._showTotalPages - 1;
    this.initPageRange();
  }
}
