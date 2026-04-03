<?php
session_start();
if (!isset($_SESSION['usern'])) {
  header('Location: ' . '../../../index.php', true, '303');
  exit;
}
require('../../../class/db.php');

// //DELETE 
// if ($_SERVER['REQUEST_METHOD'] === 'POST') {
//     $kisi_id = $_POST['kisi_id'];
//     $db->delete("KAYITLAR",'id='.$kisi_id);
// }

// // Kişileri veritabanından alın
// $sql = "SELECT * FROM KAYITLAR";
// $kisiler = $db->select($sql);
?>
<!DOCTYPE html>
<html lang="tr">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="">
    <meta name="author" content="">

    <title>Lizay İletişim</title>

    <!-- Custom fonts for this template-->
    <link href="../../vendors/vendors/vendor/fontawesome-free/css/all.min.css" rel="stylesheet" type="text/css">
    <link
        href="https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i"
        rel="stylesheet">

    <!-- Custom styles for this template-->
    <link href="../../vendors/vendors/css/sb-admin-2.min.css" rel="stylesheet">

</head>

<body id="page-top">

    <!-- Page Wrapper -->
    <div id="wrapper">

        <!-- Sidebar -->
        <ul class="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">

            <!-- Sidebar - Brand -->
            <a class="sidebar-brand d-flex align-items-center justify-content-center" href="https://online.lizaypirlanta.com/wsindex.php">
                <div class="sidebar-brand-icon rotate-n-15">
                    <i class="fas fa-laugh-wink"></i>
                </div>
                <div class="sidebar-brand-text mx-3">Lizay <sup>İletişim</sup></div>
            </a>



            <!-- Nav Item - Tables -->
            <li class="nav-item">
            <a class="nav-link" href="../">
                    <i class="fas fa-fw fa-table"></i>
                    <span>Geri Dön</span></a>
<!--                     
                <a class="nav-link" href="index.php">
                    <i class="fas fa-fw fa-table"></i>
                    <span>Çalışanlar</span></a> -->
            </li>

            <!-- Divider -->
            <hr class="sidebar-divider d-none d-md-block">

            <!-- Sidebar Toggler (Sidebar) -->
            <div class="text-center d-none d-md-inline">
                <button class="rounded-circle border-0" id="sidebarToggle"></button>
            </div>


        </ul>
        <!-- End of Sidebar -->

        <!-- Content Wrapper -->
        <div id="content-wrapper" class="d-flex flex-column">

            <!-- Main Content -->
            <div id="content">

                <!-- Topbar -->
                <nav class="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">

                    <!-- Sidebar Toggle (Topbar) -->
                    <form class="form-inline">
                        <button id="sidebarToggleTop" class="btn btn-link d-md-none rounded-circle mr-3">
                            <i class="fa fa-bars"></i>
                        </button>
                    </form>

                    <!-- Topbar Navbar -->
                    <ul class="navbar-nav ml-auto">

                      

                        <div class="topbar-divider d-none d-sm-block"></div>

                        <!-- Nav Item - User Information -->
                        <li class="nav-item dropdown no-arrow">
                            <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button"
                                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <span class="mr-2 d-none d-lg-inline text-gray-600 small">İletişim</span>
                                <img class="img-profile rounded-circle"
                                    src="../../vendors/vendors/img/undraw_profile.svg">
                            </a>
                           
                        </li>

                    </ul>

                </nav>
                <!-- End of Topbar -->

                <!-- Begin Page Content -->
                <div class="container-fluid">

                    <!-- DataTales Example -->
                    <div class="card shadow mb-4">
                        <div class="card-header py-3">
                            <h6 class="m-0 font-weight-bold text-primary">Mail Grupları</h6>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
                                    <thead>
                                        <tr>
                                            <th>Departman</th>
                                            <th>E-Posta</th>
                                            <!-- <th>Kayıt Tarihi</th>
                                            <th>Sil</th> -->
                                        </tr>
                                    </thead>
                                    <tbody>

                                                <tr>
                                                    <td>Yönetim Kurulu</td>
                                                    <td>yk@lizaypirlanta.com</td>
                                                </tr>
                                                <tr>
                                                    <td>Satın Alma</td>
                                                    <td>talep@lizaypirlanta.com</td>
                                                </tr>

                                                <tr>
                                                    <td>Bilgi İşlem / IAS Destek</td>
                                                    <td>bt@lizaypirlanta.com</td>
                                                </tr>

                                                <tr>
                                                    <td>İnsan Kaynakları</td>
                                                    <td>insankaynaklari@lizaypirlanta.com</td>
                                                </tr>

                                                <tr>
                                                    <td>Finans</td>
                                                    <td>finans@lizaypirlanta.com</td>
                                                </tr>

                                                <tr>
                                                    <td>e-Ticaret</td>
                                                    <td>eticaret@lizaypirlanta.com</td>
                                                </tr>

                                                <tr>
                                                    <td>Muhasebe</td>
                                                    <td>muhasebe@lizaypirlanta.com</td>
                                                </tr>

                                                <tr>
                                                    <td>Lizay Bölge Müdürleri</td>
                                                    <td>lbm@lizaypirlanta.com</td>
                                                </tr>

                                                <tr>
                                                    <td>Franchise Bölge Müdürleri</td>
                                                    <td>fbm@lizaypirlanta.com</td>
                                                </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
                <!-- /.container-fluid -->

            </div>
            <!-- End of Main Content -->

            <!-- Footer -->
            <footer class="sticky-footer bg-white">
                <div class="container my-auto">
                    <div class="copyright text-center my-auto">
                        <span>Copyright &copy; Lizay 2023</span>
                    </div>
                </div>
            </footer>
            <!-- End of Footer -->

        </div>
        <!-- End of Content Wrapper -->

    </div>
    <!-- End of Page Wrapper -->

    <!-- Scroll to Top Button-->
    <a class="scroll-to-top rounded" href="#page-top">
        <i class="fas fa-angle-up"></i>
    </a>

   

    <!-- Bootstrap core JavaScript-->
    <script src="../../vendors/vendors/vendor/jquery/jquery.min.js"></script>
    <script src="../../vendors/vendors/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>

    <!-- Core plugin JavaScript-->
    <script src="../../vendors/vendors/vendor/jquery-easing/jquery.easing.min.js"></script>

    <!-- Custom scripts for all pages-->
    <script src="../../vendors/vendors/js/sb-admin-2.min.js"></script>

    <!-- Page level plugins -->
    <script src="../../vendors/vendors/vendor/datatables/jquery.dataTables.min.js"></script>
    <script src="../../vendors/vendors/vendor/datatables/dataTables.bootstrap4.min.js"></script>

    <!-- Page level custom scripts -->
    <script src="../../vendors/vendors/js/demo/datatables-demo.js"></script>
</body>

</html>
