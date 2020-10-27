import {
  AfterViewInit,
  Directive,
  DoCheck,
  Host,
  Optional,
  Renderer2,
  Self,
  ViewContainerRef
} from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatButton } from '@angular/material/button';

@Directive({
  selector: '[appPagination]'
})

export class PaginatorDirective implements DoCheck, AfterViewInit {
  private currentPage: number;
  private pageGapTxt: string[];
  private rangeStart: number;
  private rangeEnd: number;
  private buttons: MatButton[] = [];
  private showTotalPages: number;
  private checkPage: number[];

  constructor(
    @Host() @Self() @Optional() private readonly matPag: MatPaginator,
    private readonly ViewContainer: ViewContainerRef,
    private readonly renderer: Renderer2
  ) {
    this.currentPage = 1;
    this.pageGapTxt = ['•••', '---'];
    this.showTotalPages = 3;
    this.checkPage = [0, 0, 0];
    // Display custom range label text
    this.matPag._intl.getRangeLabel = (page: number, pageSize: number, length: number): string => {
      const startIndex = page * pageSize;
      const endIndex = startIndex < length ?
        Math.min(startIndex + pageSize, length) :
        startIndex + pageSize;
      return length > 0 ? 'Showing ' + (startIndex + 1) + ' – ' + endIndex + ' of ' + length + ' records' : 'Showing 0 – 0 of 0 records';
    };
    // Subscribe to rerender buttons when next page and last page button is used
    this.matPag.page.subscribe((paginator: PageEvent) => {
      this.currentPage = paginator.pageIndex;
      this.matPag.pageIndex = paginator.pageIndex;
      this.initPageRange();
    });
  }

  ngDoCheck(): void {
    // Reset paginator if the pageSize, pageIndex, length changes
    if (this.matPag?.length !== this.checkPage[0]
      ||
      this.matPag?.pageSize !== this.checkPage[1]
      ||
      this.matPag?.pageIndex !== this.checkPage[2]
    ) {
      const pageCount = this.matPag.getNumberOfPages();
      if (this.currentPage > pageCount && pageCount !== 0) {
        this.currentPage = 1;
        this.matPag.pageIndex = 0;
      }
      this.currentPage = this.matPag.pageIndex;
      this.initPageRange();
      this.checkPage = [this.matPag.length, this.matPag.pageSize, this.matPag.pageIndex];
    }
  }

  private buildPageNumbers = () => {
    let dots: boolean[];
    let page: number;
    let pageDifference: number;
    let startIndex: number;
    let totalPages: number;
    totalPages = this.matPag.getNumberOfPages();
    // Container div with paginator elements
    const actionContainer = this.ViewContainer.element.nativeElement.querySelector(
      'div.mat-paginator-range-actions'
    );
    // Button that triggers the next page action
    const nextPageNode = this.ViewContainer.element.nativeElement.querySelector(
      'button.mat-paginator-navigation-next'
    );
    // Label showing the page range
    const pageRange = this.ViewContainer.element.nativeElement.querySelector(
      'div.mat-paginator-range-label'
    );

    let prevButtonCount = this.buttons.length;

    // Remove buttons before creating new ones
    if (prevButtonCount > 0) {
      this.buttons.forEach(button => {
        this.renderer.removeChild(actionContainer, button);
      });
      // Empty state array
      prevButtonCount = 0;
    }

    this.renderer.addClass(pageRange, 'custom-paginator-counter');
    this.renderer.addClass(actionContainer, 'custom-paginator-container');

    // Initialize next page and last page buttons
    if (prevButtonCount === 0) {
      const nodeArray = actionContainer.childNodes;
      setTimeout(() => {
        for (const node of nodeArray) {
          if (node.nodeName === 'BUTTON') {
            // Next Button styles
            if (node.innerHTML.length > 100 && node.disabled) {
              this.renderer.addClass(node, 'custom-paginator-arrow-disabled');
              this.renderer.removeClass(node, 'custom-paginator-arrow-enabled');
            } else if (
              node.innerHTML.length > 100 &&
              !node.disabled
            ) {
              this.renderer.addClass(node, 'custom-paginator-arrow-enabled');
              this.renderer.removeClass(node, 'custom-paginator-arrow-disabled');
            }
          }
        }
      });
    }

    dots = [false, false];

    if (totalPages > 0) {
      this.renderer.insertBefore(
        actionContainer,
        this.createButton('0', this.matPag.pageIndex),
        nextPageNode
      );
    }

    page = this.showTotalPages + 2;
    pageDifference = totalPages - page;
    startIndex = Math.max(this.currentPage - this.showTotalPages - 2, 1);

    for (let index = startIndex; index < totalPages - 1; index = index + 1) {
      if (
        (index < page && this.currentPage <= this.showTotalPages)
        ||
        (index >= this.rangeStart && index <= this.rangeEnd)
        ||
        (this.currentPage > pageDifference && index >= pageDifference)
        ||
        (totalPages < this.showTotalPages + page)
      ) {
        this.renderer.insertBefore(
          actionContainer,
          this.createButton(`${index}`, this.matPag.pageIndex),
          nextPageNode
        );
      } else {
        if (index > this.rangeEnd && !dots[0]) {
          this.renderer.insertBefore(
            actionContainer,
            this.createButton(this.pageGapTxt[0], this.matPag.pageIndex),
            nextPageNode
          );
          dots[0] = true;
          break;
        }
        if (index < this.rangeEnd && !dots[1]) {
          this.renderer.insertBefore(
            actionContainer,
            this.createButton(this.pageGapTxt[1], this.matPag.pageIndex),
            nextPageNode
          );
          dots[1] = true;
        }
      }
    }

    if (totalPages > 1) {
      this.renderer.insertBefore(
        actionContainer,
        this.createButton(`${totalPages - 1}`, this.matPag.pageIndex),
        nextPageNode
      );
    }
  }

  private createButton(index: string, pageIndex: number): MatButton {
    const linkBtn: MatButton = this.renderer.createElement('button');
    this.renderer.setAttribute(linkBtn, 'class', 'custom-paginator-page');
    this.renderer.addClass(linkBtn, 'custom-paginator-page-enabled');
    if (index === this.pageGapTxt[0] || index === this.pageGapTxt[1]) {
      this.renderer.addClass(linkBtn, 'custom-paginator-arrow-enabled');
    }
    const pagingTxt = isNaN(+ index) ? this.pageGapTxt[0] : (+ index + 1);
    const text = this.renderer.createText(pagingTxt + '');
    this.renderer.addClass(linkBtn, 'mat-custom-page');
    switch (index) {
      case `${pageIndex}`:
        this.renderer.setAttribute(linkBtn, 'disabled', 'disabled');
        this.renderer.removeClass(linkBtn, 'custom-paginator-page-enabled');
        this.renderer.addClass(linkBtn, 'custom-paginator-page-disabled');
        break;
      case this.pageGapTxt[0]:
        this.renderer.listen(linkBtn, 'click', () => {
          this.switchPage(this.currentPage < this.showTotalPages + 1
             ? this.showTotalPages + 2
            : this.currentPage + this.showTotalPages - 1
          );
        });
        break;
      case this.pageGapTxt[1]:
        this.renderer.listen(linkBtn, 'click', () => {
          this.switchPage(this.currentPage > this.matPag.getNumberOfPages() - this.showTotalPages - 2
            ? this.matPag.getNumberOfPages() - this.showTotalPages - 3
            : this.currentPage - this.showTotalPages + 1
          );
        });
        break;
      default:
        this.renderer.listen(linkBtn, 'click', () => {
          this.switchPage(+ index);
        });
        break;
    }
    this.renderer.appendChild(linkBtn, text);
    // Add button to private array for state
    this.buttons.push(linkBtn);
    return linkBtn;
  }

  /**
   * @description calculates the button range based on class input parameters and based on current page index value.
   */
  private initPageRange(): void {
    this.rangeStart = this.currentPage - this.showTotalPages / 2;
    this.rangeEnd = this.currentPage + this.showTotalPages / 2;
    this.buildPageNumbers();
  }

  private switchPage(index: number): void {
    this.matPag.pageIndex = index;
    this.matPag.page.emit({
      previousPageIndex: this.currentPage,
      pageIndex: index,
      pageSize: this.matPag.pageSize,
      length: this.matPag.length
    });
    this.currentPage = index;
    this.initPageRange();
  }

  public ngAfterViewInit(): void {
    this.rangeStart = 0;
    this.rangeEnd = this.showTotalPages - 1;
    this.initPageRange();
  }
}
