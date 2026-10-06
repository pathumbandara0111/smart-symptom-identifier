import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/providers.dart';
import '../../core/theme.dart';
import '../../models/hospital.dart';
import '../../services/location_service.dart';
import '../../widgets/auth_avatar.dart';
import '../../widgets/glass_card.dart';
import '../../widgets/state_views.dart';

class DoctorLocatorScreen extends ConsumerStatefulWidget {
  const DoctorLocatorScreen({super.key});

  @override
  ConsumerState<DoctorLocatorScreen> createState() =>
      _DoctorLocatorScreenState();
}

class _DoctorLocatorScreenState extends ConsumerState<DoctorLocatorScreen> {
  late Future<({List<Hospital> hospitals, UserLocation? location})> _future;
  final _search = TextEditingController();
  String _query = '';
  List<Hospital> _hospitals = [];
  UserLocation? _location;
  Set<Marker> _markers = {};
  LatLng _center = const LatLng(7.8731, 80.7718); // Sri Lanka

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<({List<Hospital> hospitals, UserLocation? location})> _load() async {
    final location = await ref
        .read(locationServiceProvider)
        .getCurrentLocation();
    final list = await ref.read(supabaseServiceProvider).fetchHospitals();
    var sorted = list;
    if (location != null) {
      // Nearest first.
      sorted = [...list]
        ..sort(
          (a, b) =>
              _distanceKm(a, location).compareTo(_distanceKm(b, location)),
        );
    }
    if (!mounted) return (hospitals: sorted, location: location);
    setState(() {
      _hospitals = sorted;
      _location = location;
      if (location != null) _center = LatLng(location.lat, location.lng);
    });
    _buildMarkers(sorted);
    return (hospitals: sorted, location: location);
  }

  double _distanceKm(Hospital h, UserLocation u) =>
      LocationService.distanceKm(u.lat, u.lng, h.lat, h.lng);

  double? _distanceOf(Hospital h) {
    final u = _location;
    return u == null ? null : _distanceKm(h, u);
  }

  void _buildMarkers(List<Hospital> list) {
    _markers = {
      for (final h in list)
        Marker(
          markerId: MarkerId(h.id),
          position: LatLng(h.lat, h.lng),
          infoWindow: InfoWindow(title: h.name, snippet: h.address),
          onTap: () => _center = LatLng(h.lat, h.lng),
        ),
    };
  }

  List<Hospital> get _filtered {
    if (_query.isEmpty) return _hospitals;
    final q = _query.toLowerCase();
    return _hospitals
        .where(
          (h) =>
              h.name.toLowerCase().contains(q) ||
              h.address.toLowerCase().contains(q) ||
              h.doctors.any((d) => d.speciality.toLowerCase().contains(q)),
        )
        .toList();
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  Future<void> _call(String number) async {
    final uri = Uri(scheme: 'tel', path: number.replaceAll(' ', ''));
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }

  Future<void> _directions(Hospital h) async {
    final uri = Uri.parse(
      'https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}',
    );
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }

  void _showHospital(Hospital h) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.bg,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => _HospitalDetail(
        hospital: h,
        onCall: _call,
        onDirections: () => _directions(h),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Find Doctors'),
        actions: const [AuthAvatar()],
      ),
      body: SafeArea(
        child:
            FutureBuilder<({List<Hospital> hospitals, UserLocation? location})>(
              future: _future,
              builder: (context, snapshot) {
                if (snapshot.connectionState != ConnectionState.done) {
                  return const AppLoading();
                }
                if (snapshot.hasError) {
                  return AppError(
                    message: 'Could not load hospitals',
                    onRetry: () => setState(() {
                      _future = _load();
                    }),
                  );
                }
                return Column(
                  children: [
                    if (_location == null && _hospitals.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.amber.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: AppColors.amber.withValues(alpha: 0.4),
                            ),
                          ),
                          child: const Row(
                            children: [
                              Icon(
                                Icons.location_off,
                                size: 16,
                                color: AppColors.amber,
                              ),
                              SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  'Location unavailable — showing all hospitals.',
                                  style: TextStyle(
                                    color: AppColors.textSecondary,
                                    fontSize: 13,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
                      child: TextField(
                        controller: _search,
                        onChanged: (v) => setState(() => _query = v),
                        decoration: InputDecoration(
                          hintText: 'Search hospital or speciality',
                          prefixIcon: const Icon(Icons.search),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(30),
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      flex: 2,
                      child: ClipRRect(
                        borderRadius: const BorderRadius.all(
                          Radius.circular(16),
                        ),
                        child: GoogleMap(
                          initialCameraPosition: CameraPosition(
                            target: _center,
                            zoom: 11,
                          ),
                          markers: _markers,
                          onMapCreated: (controller) => controller
                              .animateCamera(CameraUpdate.newLatLng(_center)),
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Expanded(
                      flex: 3,
                      child: _filtered.isEmpty
                          ? const AppEmpty(title: 'No hospitals found')
                          : ListView.separated(
                              padding: const EdgeInsets.all(12),
                              itemCount: _filtered.length,
                              separatorBuilder: (_, _) =>
                                  const SizedBox(height: 10),
                              itemBuilder: (context, i) {
                                final h = _filtered[i];
                                return _HospitalTile(
                                  hospital: h,
                                  distanceKm: _distanceOf(h),
                                  onTap: () => _showHospital(h),
                                );
                              },
                            ),
                    ),
                  ],
                );
              },
            ),
      ),
    );
  }
}

class _HospitalTile extends StatelessWidget {
  const _HospitalTile({
    required this.hospital,
    required this.onTap,
    this.distanceKm,
  });

  final Hospital hospital;
  final VoidCallback onTap;
  final double? distanceKm;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      onTap: onTap,
      padding: const EdgeInsets.all(14),
      child: Row(
        children: [
          const Icon(Icons.local_hospital, color: AppColors.cyan),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  hospital.name,
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
                Text(
                  hospital.address,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          if (distanceKm != null) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.cyan.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                LocationService.formatDistance(distanceKm!),
                style: const TextStyle(
                  color: AppColors.cyan,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            const SizedBox(width: 8),
          ],
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.green.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              '${hospital.doctors.length} docs',
              style: const TextStyle(
                color: AppColors.green,
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _HospitalDetail extends StatelessWidget {
  const _HospitalDetail({
    required this.hospital,
    required this.onCall,
    required this.onDirections,
  });

  final Hospital hospital;
  final void Function(String) onCall;
  final VoidCallback onDirections;

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.6,
      builder: (context, scrollController) => Padding(
        padding: const EdgeInsets.all(20),
        child: ListView(
          controller: scrollController,
          children: [
            Text(
              hospital.name,
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.cyan.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    hospital.type,
                    style: const TextStyle(color: AppColors.cyan, fontSize: 12),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(Icons.place, size: 18, color: AppColors.textMuted),
                const SizedBox(width: 6),
                Expanded(child: Text(hospital.address)),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.phone, size: 18, color: AppColors.textMuted),
                const SizedBox(width: 6),
                Text(hospital.phone),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: FilledButton.icon(
                    onPressed: () => onCall(hospital.phone),
                    icon: const Icon(Icons.phone),
                    label: const Text('Call'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: onDirections,
                    icon: const Icon(Icons.directions),
                    label: const Text('Directions'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            const Text(
              'Available doctors',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 8),
            if (hospital.doctors.isEmpty)
              const Text(
                'No doctors listed.',
                style: TextStyle(color: AppColors.textMuted),
              )
            else
              ...hospital.doctors.map(
                (d) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: GlassCard(
                    padding: const EdgeInsets.all(14),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                d.name,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              Text(
                                d.speciality,
                                style: const TextStyle(
                                  color: AppColors.textMuted,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Text(
                          'Rs. ${d.fee.toInt()}',
                          style: const TextStyle(
                            fontWeight: FontWeight.w800,
                            color: AppColors.amber,
                          ),
                        ),
                        IconButton(
                          onPressed: () => onCall(d.phone),
                          icon: const Icon(Icons.phone),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
