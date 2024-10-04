export const formatCurrency = (amount: number) => {
  return (amount / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
};

export const formatDateToLocal = (
  dateStr: string,
  locale: string = 'en-US',
) => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(date);
};
export const formatDateTimeToLocal = (
  dateStr: string,
  locale: string = 'en-US',
) => {
  const date = new Date(dateStr);
  //const date = getMyDateTime(tmpdate);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: "h12",
    /* hour12: false,
    hourCycle:'h11',
    timeZone:'Asia/Rangoon', */
  };
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(date);
};

const dayCountsForMonths = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
const month_index = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };

// 2024-01-12T06:55:52.693Z
export const getMyDateTime0630 = (dateString:string) => {
  console.log('passed date str>> ', dateString)
  const tmp = dateString.split('-');
  //[0] => "2024" 
  //[1] => "01" 
  //[2] => "12T06:55:52.693Z"
  let year$ = +tmp[0];
  let month$ = +tmp[1]/*  - 1 */;

  const tmp1 = tmp[2].split('T');
  //[0] => "12" 
  //[1] => "06:55:52.693Z"
  let day$ = +tmp1[0];

  const tmp2 = tmp1[1].split(':'); 
  //[0] => "06" 
  //[1] => "55" 
  //[2] => "52.693Z"
  let hr$ = +tmp2[0];
  let min$ = +tmp2[1];

  //const tmp3 = tmp2[2].split('Z'); 
  //[0] => "52.693" 
  //[1] => empty!

  if(min$ + 30 >= 60 ) {
      hr$ += 1;

      min$ = (min$ + 30) - 60;

      if(hr$ + 6 >= 24) {
          day$ += 1;

          hr$ = (hr$ + 6) - 24;

          if(day$ > (dayCountsForMonths[month$])) {
              month$ += 1;

              day$ = day$ - dayCountsForMonths[month$];

              if(month$ > 11) {
                  year$ += 1;

                  month$ = month$ - 11;
              }
          }
      } else {
          hr$ += 6;
      }

  } else {
      min$ += 30;//33

      if(hr$ + 6 >= 24) {
          day$ += 1;

          hr$ = (hr$ + 6) - 24;

          if(day$ > (dayCountsForMonths[month$])) {
              month$ += 1;

              day$ = day$ - dayCountsForMonths[month$];

              if(month$ > 11) {
                  year$ += 1;

                  month$ = month$ - 11;
              }
          }
      } else {
          hr$ += 6;
      }
  }

  console.log('y,m,d,h,m > ', year$, month$, day$, hr$, min$)
  return new Date(year$, month$, day$, hr$, min$, 0);
}

// 2024-01-12T06:55:52.693Z
export const getMyDateTimeSubs12 = (dateString:string) => {
  //console.log('passed date str>> ', dateString)
  const tmp = dateString.split('-');
  //[0] => "2024" 
  //[1] => "01" 
  //[2] => "12T06:55:52.693Z"
  let year$ = +tmp[0];
  let month$ = +tmp[1] - 1;

  const tmp1 = tmp[2].split('T');
  //[0] => "12" 
  //[1] => "06:55:52.693Z"
  let day$ = +tmp1[0];

  const tmp2 = tmp1[1].split(':'); 
  //[0] => "06" 
  //[1] => "55" 
  //[2] => "52.693Z"
  let hr$ = +tmp2[0];
  let min$ = +tmp2[1];

  //console.log('y,m,d,h,m > ', year$, month$, day$, hr$, min$)
  return new Date(year$, month$, day$, hr$, min$, 0);
}

export const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
};