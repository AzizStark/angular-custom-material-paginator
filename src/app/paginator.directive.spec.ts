import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild, Type, Provider } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ThemePalette } from '@angular/material/core';
import { MatPaginatorModule, MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { PaginatorDirective } from './pagination.directive';

describe('Test custom paginator directive', () => {

  let fixture: ComponentFixture<MatPaginatorApp>;
  let component: MatPaginatorApp;
  let paginatorElement: HTMLElement;

  beforeEach(() => {
    fixture = createComponent(MatPaginatorApp);
    component = fixture.componentInstance;
    paginatorElement = getPaginatorElement(fixture);
  });

  it('Should show the right range numbers', () => {
    const rangeElement = getRangeLabelElement(fixture);
    component.length = 100;
    component.pageSize = 10;
    component.pageIndex = 1;
    fixture.detectChanges();
    expect(rangeElement.innerHTML.trim()).toBe('Showing 11 – 20 of 100 records');
  });

  it('Should remove the two dotted skip buttons when total pages is less than 6', () => {
    component.length = 60;
    component.pageSize = 10;
    component.pageIndex = 1;
    fixture.detectChanges();
    const dottedButtons = getElementsByText(paginatorElement, 'button', '•••'); // Search for dotted skip buttons
    expect(dottedButtons.length).toEqual(0); // No dotted button elements should be present
  });

  it('Should disable the previous button and button [1] must be highlighted and disabled when current page is 1', () => {
    component.length = 100;
    component.pageSize = 10;
    component.pageIndex = 0;
    fixture.detectChanges();
    const firstPageButton = getElementByText(paginatorElement, 'button', '1');
    expect(firstPageButton.hasAttribute('disabled')).toBe(true); // Must be disabled from clicking it
    expect(firstPageButton.classList.contains('custom-paginator-page-disabled')).toBe(true); // Disabled styles must be present
    expect(getPreviousButton(fixture).hasAttribute('disabled')).toBe(true); // Must be disabled from clicking it
  });

  it('Should disable the next button and lastPage button must be highlighted and disabled when current page is the last page', () => {
    component.length = 100;
    component.pageSize = 10;
    component.pageIndex = 9;
    fixture.detectChanges();
    const firstPageButton = getElementByText(paginatorElement, 'button', '10');
    expect(firstPageButton.hasAttribute('disabled')).toBe(true); // Must be disabled from clicking it
    expect(firstPageButton.classList.contains('custom-paginator-page-disabled')).toBe(true); // Disabled styles must be present
    expect(getNextButton(fixture).hasAttribute('disabled')).toBe(true);  // Must be disabled from clicking it
  });

  it('Should not display the first dotted skip button when current page is not greater than 3', () => {
    component.length = 100;
    component.pageSize = 10;
    component.pageIndex = 2;
    fixture.detectChanges();
    const dottedButtons = getElementsByText(paginatorElement, 'button', '•••');
    expect(dottedButtons.length).toEqual(1); // Only the last dotted button must be present
    expect(dottedButtons[0].nextSibling.textContent).toEqual('10'); // It must be the last one
  });

  it('Should not display the second dotted skip button when current page is not lesser than [total pages - 3]', () => {
    component.length = 1000;
    component.pageSize = 10;
    component.pageIndex = 96;
    fixture.detectChanges();
    const dottedButtons = getElementsByText(paginatorElement, 'button', '•••');
    expect(dottedButtons[0].previousSibling.textContent).toEqual('1'); // Only first dotted button must be present
    expect(dottedButtons.length).toEqual(1); // To Ensure that its the first one
  });

  it('Should highlight the current page button and it must be disabled', () => {
    component.length = 100;
    component.pageSize = 10;
    component.pageIndex = 5;
    fixture.detectChanges();
    const pageButton = getElementByText(paginatorElement, 'button', '6');
    expect(pageButton).toBeDefined(); // Current page must be present
    expect(pageButton.hasAttribute('disabled')).toBe(true); // Current page must be disabled from clicking it
    expect(pageButton.classList.contains('custom-paginator-page-disabled')).toBe(true); // Current page must be the highlighted
  });

  it('Should show total page count by the division of [Length by PageSize].', () => {
    component.length = 1000;
    component.pageSize = 11;
    component.pageIndex = 0;
    fixture.detectChanges();
    const rangeElement = getRangeLabelElement(fixture);
    expect(rangeElement.innerHTML.trim()).toBe('Showing 1 – 11 of 1000 records');
    const lastPageButton = getNextButton(fixture).previousSibling.textContent;
         // Must show the correct total Page count (Length / PageSize)
    expect(lastPageButton).toBe(`${Math.ceil(component.length / component.pageSize)}`);
  });

  it('Should emit correct page index value and page size value when they are changed', () => {
    const paginator = component.paginator;
    component.length = 100;
    component.pageSize = 10;
    component.pageIndex = 0;
    fixture.detectChanges();
    paginator.pageSize = 20;
    const pageButton = getNativeElementsByText(fixture, 'button', '3');
    pageButton[0].click(); // Click the 3 button element
    fixture.detectChanges();
    expect(component.pageEvent).toHaveBeenCalledWith(jasmine.objectContaining({
      length: 100,
      pageIndex: 2, // Changed the page index
      pageSize: 20, // Changed the page size
      previousPageIndex: 0
    })); // Check the emitted event
  });

  it('Should show first dotted skip pages button after page button 1 when current page is greater than 4', () => {
    component.length = 100;
    component.pageSize = 10;
    component.pageIndex = 5;
    fixture.detectChanges();
    const dottedButtons = getElementsByText(paginatorElement, 'button', '•••');
    expect(dottedButtons.length).toEqual(2); // Both the dotted buttons must be present
    expect(dottedButtons[0].previousSibling.textContent).toEqual('1');
  });

  it('Should show second dotted skip pages button before total pages button when page count is smaller than [total pages - 4]', () => {
    component.length = 1000;
    component.pageSize = 10;
    component.pageIndex = 95; // Must be smaller than 96
    fixture.detectChanges();
    const dottedButtons = getElementsByText(paginatorElement, 'button', '•••');
    expect(dottedButtons.length).toEqual(2); // Both first and last skip button must be present
    expect(dottedButtons[1].nextSibling.textContent).toEqual('100');
  });

  it('Should skip 2 pages forward when second dotted skip page button is clicked.', () => {
    component.length = 1000;
    component.pageSize = 10;
    component.pageIndex = 5; // Must be greater than 4
    fixture.detectChanges();
    const dottedNativeButtons = getNativeElementsByText(fixture, 'button', '•••');
    dottedNativeButtons[1].click(); // Click the skip buttons element
    fixture.detectChanges();
    const currentPageButton = getElementByText(paginatorElement, 'button', '8'); // Current page must be  ((5 + 1) + 2 )
    expect(currentPageButton).toBeDefined(); // Page button must be present
     // 8 Must be the current page (So must it be disabled from clicking it)
    expect(currentPageButton.classList.contains('custom-paginator-page-disabled')).toBe(true);
    // Current page must be in the middle
    expect(currentPageButton.previousSibling.textContent).toEqual('7'); // Previous page element must be present
    expect(currentPageButton.nextSibling.textContent).toEqual('9'); // Next page element must be present
  });

  it('Should skip 2 pages backward when first dotted skip page button is clicked.', () => {
    component.length = 1000;
    component.pageSize = 10;
    component.pageIndex = 95; // Must be smaller than 96
    fixture.detectChanges();
    const dottedNativeButtons = getNativeElementsByText(fixture, 'button', '•••');
    dottedNativeButtons[0].click(); // Click the skip buttons element
    fixture.detectChanges();
    const currentPageButton = getElementByText(paginatorElement, 'button', '94'); // Current page must be 94 ((95 + 1) - 2 )
    expect(currentPageButton).toBeDefined(); // Page button must be present
     // 94 Must be the current page (So must it be disabled from clicking it)
    expect(currentPageButton.classList.contains('custom-paginator-page-disabled')).toBe(true);
    // Current page must be in the middle
    expect(currentPageButton.previousSibling.textContent).toEqual('93'); // Previous page element must be present
    expect(currentPageButton.nextSibling.textContent).toEqual('95'); // Next page element must be present
  });

  it('Should not allow a negative page size', () => {
    const paginator = component.paginator;
    paginator.pageSize = -777;
    expect(paginator.pageSize).toBeGreaterThanOrEqual(0); // Must be greater than 0
  });

  it('Should not allow a negative page index', () => {
    const paginator = component.paginator;
    paginator.pageIndex = -77;
    const firstPageButton = getElementByText(paginatorElement, 'button', '1');
    expect(paginator.pageIndex).toBeGreaterThanOrEqual(0); // Must not be a negative value
    expect(firstPageButton.hasAttribute('disabled')).toBe(true); // Must be disabled from clicking it
    expect(firstPageButton.classList.contains('custom-paginator-page-disabled')).toBe(true); // Disabled styles must be present
  });
});

@Component({
  template: `
    <mat-paginator appPagination
                   [pageIndex]="pageIndex"
                   [pageSize]="pageSize"
                   [pageSizeOptions]="pageSizeOptions"
                   [hidePageSize]="hidePageSize"
                   [showFirstLastButtons]="showFirstLastButtons"
                   [length]="length"
                   [color]="color"
                   [disabled]="disabled"
                   (page)="pageEvent($event)">
    </mat-paginator>
  `,
})

// tslint:disable-next-line: component-class-suffix
class MatPaginatorApp {
  pageIndex = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 100];
  hidePageSize = false;
  showFirstLastButtons = false;
  length = 100;
  disabled: boolean;
  pageEvent = jasmine.createSpy('Page Event');
  color: ThemePalette;
  @ViewChild(MatPaginator) paginator: MatPaginator;
}

function createComponent<T>(type: Type<T>, providers: Provider[] = []): ComponentFixture<T> {
  TestBed.configureTestingModule({
    imports: [MatPaginatorModule, NoopAnimationsModule],
    declarations: [type, PaginatorDirective],
    providers: [MatPaginatorIntl, ...providers]
  }).compileComponents();
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return fixture;
}

function getRangeLabelElement(fixture: ComponentFixture<MatPaginatorApp>): HTMLElement {
  return fixture.nativeElement.querySelector('.mat-paginator-range-label');
}

function getPaginatorElement(fixture: ComponentFixture<MatPaginatorApp>): HTMLElement {
  return fixture.nativeElement.querySelector('.mat-paginator-range-actions');
}

function getPreviousButton(fixture: ComponentFixture<MatPaginatorApp>): HTMLElement {
  return fixture.nativeElement.querySelector('.mat-paginator-navigation-previous');
}

function getNextButton(fixture: ComponentFixture<MatPaginatorApp>): HTMLElement {
  return fixture.nativeElement.querySelector('.mat-paginator-navigation-next');
}

function getNativeElementsByText(fixture: ComponentFixture<MatPaginatorApp>, type: string, text: string): HTMLElement[] {
  const nativeElements: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll(type));
  return nativeElements.filter(element => element.innerHTML === text);
}

function getElementsByText(paginatorElement: HTMLElement, type: string, text: string): Element[] {
  return Array.from(paginatorElement.querySelectorAll(type))
    .filter(element => element.textContent === text);
}

function getElementByText(paginatorElement: HTMLElement, type: string, text: string): Element {
  return Array.from(paginatorElement.querySelectorAll(type))
    .find(element => element.textContent === text);
}
