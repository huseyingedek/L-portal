  <!doctype html>
  <html lang="en">
    <head>
      <!-- Required meta tags -->
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
      <meta name="csrf-token" content="{{ csrf_token() }}" />
      <!-- Bootstrap CSS -->
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
      <link rel="shortcut icon" href="435952-200.png" type="image/x-icon" />

      <title>Ara</title>
      <style type="text/css">
        body {
          background-color: #ddd !important;
        }
      </style>
    </head>
    <body>
      <div id="wait"></div>
      <div class="row mt-5">
          
        <div class="col-md-2"></div>
        <div class="col-md-8">
        <style>
            
            .card{
                
            border-radius:4.5rem;
            }
            
        </style>
          <div class="card">
              
            <div class="container-fluid">
               <center> <img src="logo_s.png" alt="logo" height="125" witdh="75"></center>
              <div class="row d-flex justify-content-center">
                <div class="col-md-9">
                  <div class="card p-4 mt-3">
                    <h3 class="heading mt-5 text-center">Barkod Ara</h3>
                    <div class="">
                      <div class="search">
                        <form action="#" method="post">   <label>Barkod Giriniz</label>
                          <input type="text" name="barkod_kodu" id="barkod_kodu" class="form-control form-control-sm" placeholder="Barkod kodu">
                          <center>
                            <button type="button" id="form_post" class="btn btn-sm btn-primary mt-2">Barkod Ara</button>
                          </center>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
          <div class="card sonuc mt-6 d-none">
            <h5 class="text-center mt-2">Sonuç</h5>
           
            <div class="sonuc_sonuc p-4"></div>
            
          </div>
        </div>
        <div class="col-md-4"></div>
      </div>
      <script src="https://code.jquery.com/jquery-3.6.1.js" integrity="sha256-3zlB5s2uwoUzrXK3BT7AX3FyvojsraNFxCc2vC/7pNI=" crossorigin="anonymous"></script>
      <script src="https://cdn.jsdelivr.net/npm/popper.js@1.14.7/dist/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
      <style type="text/css">
        #wait {
          display: none;
          position: fixed;
          z-index: 1000;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          background: rgba(255, 255, 255, .8) url('http://i.stack.imgur.com/FhHRx.gif') 50% 50% no-repeat;
          opacity: 0.80;
          -ms-filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=80);
          filter: alpha(opacity=80)
        }

        ;
      </style>
      <script>
        $.ajaxSetup({
          headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
          }
        });
        $('#form_post').on('click', function() {
          $.ajax({
            type: "POST",
            url: 'https://online.lizaypirlanta.com/fiyatgor/test.php',
            data: {
              _token: "{{ csrf_token() }}",
              barkod_kodu: $('#barkod_kodu').val(),
            },
            beforeSend: function() {
              $('#wait').css('display', 'block');
            },
            complete: function() {
              $('#wait').css('display', 'none');
            },
            success: function(data) {
               var veri = JSON.parse(data);

              $('.sonuc').removeClass('d-none');
              $('.sonuc_sonuc').html(' ');
              if (veri.data == null) { 
                $('.sonuc_sonuc').html(`
							<div class="alert alert-danger p-3">Bu barkoda ait ürün bulunamadı.</div>
        					`);
              } else { 
                var veri = JSON.parse(veri.data);
                $('.sonuc_sonuc').html(`
							<center>
								<div class="col-md-6">
									<img width="250" height="250" src="` + veri.ROW.IMGBASE64 + `">
										<h5 class="mt-3">` + veri.ROW.DETCOLOR + `</h5>
										<h5 class="text-center">` + veri.ROW.SPRICE + ` ` + veri.ROW.SPRICECURRENCY + `</h5>
										<p>Stok Durumu: ` + veri.ROW.ISWARE + `</p>
									</div>
								</center>
								<table class="table -xl">
									<thead>
										<tr>
											<th scope="col">Code</th>
											<th scope="col">Model</th>
											<th scope="col">Diamond (Ct)</th>
											<th scope="col">Color Stone</th>
											<th scope="col">Color / Clarity</th>
											<th scope="col">Gold K / Gr</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<th scope="row">` + veri.ROW.BATCHNUM + `</th>
											<td>` + veri.ROW.MATERIAL + `</td>
											<td>` + veri.ROW.D1TEXT + `</td>
											<td>` + veri.ROW.COLORSTONE + `</td>
											<td>` + veri.ROW.COLORCLARITY + `</td>
											<td>` + veri.ROW.MATGRP + `</td>
										</tr>
									</tbody>
									<table class="table"></table>
`);
              }
            },
          });
        })
      </script>
    </body>
  </html>