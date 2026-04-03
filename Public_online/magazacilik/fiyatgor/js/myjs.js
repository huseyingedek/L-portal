 $(document).ready(function() { 
     $.ajaxSetup({
         headers: {
             'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
         }
     });
     $('#barkod_kodu').on('keyup keypress keydown', function(e) {
         if (e.which == 13) {
             $("#form_post").trigger("click");
         }
     });
     $('#form_post').on('click', function(e) {
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
                 var json_uzunlugu = 0;
                 $.each(veri, function(i, item) {
                     json_uzunlugu++;
                 });
                 // return;
                 $('.sonuc').removeClass('d-none');
                 $('.sonuc_sonuc').html(' ');
                 if (veri.length == 0) {
                     $('.sonuc_sonuc').html(`
                            <div class="alert alert-danger p-3">Bu barkoda ait ürün bulunamadı.</div>
                            `);
                 } else {
                     if (json_uzunlugu > 1) {
                         $.each(veri, function(i, item) {
                             if (i == 0) {
                                 ana_tablo(item)
                             }
                         });
                     } else {
                         if (veri.ROW.SABITFIYAT != '0.0') {
                             ana_tablo(veri.ROW);
                         } else {
                             ana_tablo(veri.ROW)
                         }
                     }
                 }
             },
             error: function(e) {
                 console.log(e);
             }
         });
     })
 })

 function ana_tablo(args) {
     if (args.SABITFIYAT == '0.0') {
         $('.sonuc_sonuc').html(`
    <center>
        <div class="container container-fluid">
            <img class="radius" width="170" height="170" src="` + args.IMGBASE64 + `">
                <h5 class="mt-3">` + args.URUNADI + `</h5> 
                <h5 class="text-center">` + args.SONFIYAT + ` ` + args.SPRICECURRENCY + `</h5>
              <p>Stok Durumu: ` + args.STOKDURUMU + `</p>
              <p>Stok Açıklama: ` + args.STOKACIKLAMA + `</p>
                <p>Model: ` + args.MODEL + `</p>

        </center>
        <div class="table-responsive-lg">
        <table class="table">
            <thead>
                <tr>
                    <th scope="col">Code</th>
                    <th scope="col">Diamond (Ct)</th>
                    <th scope="col">Color Stone</th>
                    <th scope="col">Color / Clarity</th>
                    <th scope="col">Gold K / Gr</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th scope="row">` + args.BARKOD + `</th>
                    <th scope="row">` + args.DIAMOND + `</th> 
                    <td>` + args.COLORCLARITY + `</td>
                    <td>` + args.COLORSTONE + `</td>
                    <td>` + args.GOLDK + `</td>
                </tr>
            </tbody>

            </div>
            </div>
            `);
     } else {
         $('.sonuc_sonuc').html(`
    <center>
        <div class="container container-fluid">
            <img class="radius" width="170" height="170" src="` + args.IMGBASE64 + `">
                <h5 class="mt-3">` + args.URUNADI + `</h5>
                <del class="text-center">` + args.SABITFIYAT + ` ` + args.SPRICECURRENCY + `</del>
                <h5 class="text-center">` + args.SONFIYAT + ` ` + args.SPRICECURRENCY + `</h5>
              <p>Stok Durumu: ` + args.STOKDURUMU + `</p>
              <p>Stok Açıklama: ` + args.STOKACIKLAMA + `</p>
                <p>Model: ` + args.MODEL + `</p>

        </center>
        <div class="table-responsive-lg">
        <table class="table">
            <thead>
                <tr>
                    <th scope="col">Code</th>
                    <th scope="col">Diamond (Ct)</th>
                    <th scope="col">Color Stone</th>
                    <th scope="col">Color / Clarity</th>
                    <th scope="col">Gold K / Gr</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th scope="row">` + args.BARKOD + `</th>
                    <th scope="row">` + args.DIAMOND + `</th> 
                    <td>` + args.COLORCLARITY + `</td>
                    <td>` + args.COLORSTONE + `</td>
                    <td>` + args.GOLDK + `</td>
                </tr>
            </tbody>

            </div>
            </div>
            `);
     }
 }