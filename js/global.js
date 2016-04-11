(function($){
  'use strict';

  // declare input fields
  var pArray     = [];
  var $addBtn    = $('#product-entry #addBtn');
  var $pName     = $('#product-entry #product-name');
  var $pQuantity = $('#product-entry #product-quantity');
  var $pCost     = $('#product-entry #product-cost');
  var $recordRow = $('.record-row');
  var trackingNum = '<div class="col-sm-3 flex"><label for="tracking-number">Tracking Number</label><input type="text" class="form-control input-lg" id="tracking-number"></div>';
  var deliveryCost = '<div class="col-sm-3 flex"><label for="delivery-cost">Delivery Cost</label><input type="text" class="form-control input-lg" id="delivery-cost"></div>';
  var generateAuBtn = '<div class="col-sm-3 pull-right"><button type="button" class="btn btn-primary btn-lg pull-right" id="generateAuBtn">Generate PDF in $AUD</button></div>';
  var generateRmbBtn = '<div class="col-sm-3"><button type="button" class="btn btn-success btn-lg pull-right" id="generateRmbBtn">Generate PDF in RMB</button></div>';
  var $overlay = $('.lightbox');
  var $content = $('.lightbox .lightbox-content');

  function calculateTotalQuantity(){
    var total = 0;

    pArray.forEach(function(item){
      total += item.quantity;
    });

    return total;
  }

  function calculateTotalCost(){
    var total = 0;

    pArray.forEach(function(item){
      total += item.total(item.quantity, item.cost);
    });

    return total.toFixed(2);
  }

  function createPDF(currency, theme){
    // create the pdf object
    var doc = new jsPDF('p','pt');
    // get date
    var date = new Date();
    // print date format
    var printDate = 'Order Date: ' + date.getDay() + '/' + date.getMonth() + '/' + date.getFullYear();
    // get tracking number
    var tracking = $('#tracking-number').val();
    // get delivery cost
    var delivery = ( currency == 'RMB' ) ? ( parseFloat( $('#delivery-cost').val() ) * 6 ).toFixed(2) : parseFloat( $('#delivery-cost').val() ).toFixed(2);

    doc.text(20,20,printDate); // date
    doc.text(20,40,'Tracking Number:   ' + tracking); // tracking number
    doc.text(20,60,'Delivery Cost:   ' + delivery); // delivery cost
    doc.text(20,80,'Currency:   ' + currency);

    var res = doc.autoTableHtmlToJson(document.getElementsByTagName("table")[0]);

    if( currency == 'RMB'){
      // reset the unit price to RMB 
      for(var i = 0; i < res.data.length - 1; i++){
        res.data[i][2] = (parseFloat(res.data[i][2]) * 6).toFixed(2);
        res.data[i][3] = ( parseInt(res.data[i][1]) * res.data[i][2] ).toFixed(2);
      }
      // reset the total cost to RMB
      res.data[res.data.length - 1][res.data[res.data.length - 1].length -1] = ( calculateTotalCost() * 6 ).toFixed(2);
    } 

    doc.autoTable(res.columns, res.data, {
      theme: theme,
      startY: 120,
      styles: {
        overflow: 'linebreak',
        fontSize: 16,
        rowHeight: 30,
        halign: 'left',
        valign: 'middle'
      },
      columnStyles: {
        1: {columnWidth: 'auto'}
      }
    });

    doc.save( tracking + '.pdf');
  }

  function generateAuPDF(){
    // create PDF
    createPDF( 'AUD', 'striped' );
  }

  function generateRmbPDF(){
    // create PDF
    createPDF( 'RMB', 'grid' );
  }

/*
  function editProductEntry(row){

    //show overlay
    $overlay.show();

    //populate the input field with the edit product data
    //console.log($('form'));
    //retrieve the product from product array

    //change row value
    //save change

  }
*/

  // fired when add button clicked, add new entry to the table
  $addBtn.click(function(){
    
    // add title
    if( $recordRow.children().length == 0 ){
      $recordRow.append('<h4>Records</h4>');
      $recordRow.append('<table class="table table-hover"><thead><tr><th>Product</th><th>Quantity</th><th>Unit Price</th><th>Total Cost</th></tr></thead><tbody></tbody></table>');
    }

    if( $('.table').length > 0 ){
      if( !isNaN( parseInt( $pQuantity.val() ) ) && !isNaN( parseFloat( $pCost.val() ) ) ){
        var product    = {
          name: $pName.val(),
          quantity: parseInt($pQuantity.val()),
          cost: parseFloat($pCost.val()),
          total: function(quantity, cost){ return quantity * cost; }
        };
        pArray.push(product);
        
        //console.log(pArray);// test console
        $('.table tbody').append('<tr><td>' + product.name + '</td><td>' + product.quantity + '</td><td>' + product.cost + '</td><td>' + product.total(product.quantity, product.cost) + '</td></tr>');
      } else {
        alert("Invalid Input");
      }
    }

    if( $('.table tfoot').length == 0 ){
      $('.table').append('<tfoot><tr><th>Total</th><th>' + calculateTotalQuantity() + '</th><th></th><th>$' + calculateTotalCost() + '</th></tr></tfoot>');
    } else {
      $('.table tfoot th:nth-child(2)').text( calculateTotalQuantity() );
      $('.table tfoot th:nth-child(4)').text( '$' + calculateTotalCost() );
    }

    // add tracking number input
    if( $recordRow.children().length > 0 && $('#tracking-number').length == 0 ){
      $recordRow.append( trackingNum );
    } 

    // add delivery cost input
    if( $recordRow.children().length > 0 && $('#delivery-cost').length == 0 ){
      $recordRow.append( deliveryCost );
    } 

    // add generate RMB pdf button
    if( $recordRow.children().length > 0 && $('#generateRmbBtn').length == 0 ){
      $recordRow.append( generateRmbBtn );
      $('#generateRmbBtn').bind( 'click', generateRmbPDF );
    }

    // add generate AU pdf button
    if( $recordRow.children().length > 0 && $('#generateAuBtn').length == 0 ){
      $recordRow.append( generateAuBtn );
      $('#generateAuBtn').bind( 'click', generateAuPDF );
    }

    // clear all input fields
    document.getElementById('product-entry').reset();

    // bind edit to each row
/*    $('table tbody tr').bind('click', function(event){
      //console.log(this);
      editProductEntry(this);
    });*/
  });

  


}(jQuery));