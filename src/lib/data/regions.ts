export interface HarvestRegion {
  id: string
  name: string
  count: number
  lat: number
  lng: number
}

export interface ProvinceGroup {
  id: string
  name: string
  regions: HarvestRegion[]
}

export interface SelectedLocation {
  provinceId: string
  regionId: string | null
  label: string
}

export const provinceGroups: ProvinceGroup[] = [
  {
    id: 'jawa-barat',
    name: 'Jawa Barat',
    regions: [
      {
        id: 'bandung-barat',
        name: 'Bandung Barat (Lembang)',
        count: 24,
        lat: -6.8167,
        lng: 107.6167,
      },
      {
        id: 'kab-bandung',
        name: 'Kab. Bandung (Pangalengan)',
        count: 19,
        lat: -7.1667,
        lng: 107.5667,
      },
      { id: 'garut', name: 'Garut', count: 16, lat: -7.2279, lng: 107.9087 },
      { id: 'cianjur', name: 'Cianjur', count: 14, lat: -6.8168, lng: 107.1425 },
      { id: 'bogor', name: 'Bogor', count: 12, lat: -6.5971, lng: 106.806 },
      { id: 'subang', name: 'Subang', count: 11, lat: -6.5715, lng: 107.7587 },
      { id: 'sukabumi', name: 'Sukabumi', count: 9, lat: -6.9277, lng: 106.93 },
      { id: 'majalengka', name: 'Majalengka', count: 7, lat: -6.8364, lng: 108.2275 },
    ],
  },
  {
    id: 'jawa-tengah',
    name: 'Jawa Tengah',
    regions: [
      { id: 'magelang', name: 'Magelang', count: 18, lat: -7.4797, lng: 110.2177 },
      { id: 'wonosobo', name: 'Wonosobo', count: 15, lat: -7.3632, lng: 109.9002 },
      { id: 'boyolali', name: 'Boyolali', count: 13, lat: -7.5311, lng: 110.5955 },
      { id: 'brebes', name: 'Brebes', count: 12, lat: -6.8706, lng: 109.0422 },
      { id: 'semarang', name: 'Kab. Semarang', count: 10, lat: -7.1369, lng: 110.4034 },
      { id: 'temanggung', name: 'Temanggung', count: 8, lat: -7.3167, lng: 110.175 },
    ],
  },
  {
    id: 'jawa-timur',
    name: 'Jawa Timur',
    regions: [
      { id: 'malang-batu', name: 'Malang & Batu', count: 26, lat: -7.8712, lng: 112.5269 },
      { id: 'pasuruan', name: 'Pasuruan', count: 14, lat: -7.6453, lng: 112.9075 },
      { id: 'jember', name: 'Jember', count: 13, lat: -8.1724, lng: 113.7007 },
      { id: 'kediri', name: 'Kediri', count: 11, lat: -7.848, lng: 112.0178 },
      { id: 'banyuwangi', name: 'Banyuwangi', count: 10, lat: -8.2192, lng: 114.3691 },
      { id: 'blitar', name: 'Blitar', count: 9, lat: -8.0955, lng: 112.1609 },
    ],
  },
  {
    id: 'di-yogyakarta',
    name: 'DI Yogyakarta',
    regions: [
      { id: 'sleman', name: 'Sleman', count: 15, lat: -7.716, lng: 110.3556 },
      { id: 'bantul', name: 'Bantul', count: 11, lat: -7.8881, lng: 110.3288 },
      { id: 'kulon-progo', name: 'Kulon Progo', count: 9, lat: -7.8267, lng: 110.1641 },
      { id: 'gunungkidul', name: 'Gunungkidul', count: 7, lat: -7.9949, lng: 110.6025 },
    ],
  },
  {
    id: 'banten',
    name: 'Banten',
    regions: [
      { id: 'tangerang', name: 'Kab. Tangerang', count: 10, lat: -6.2024, lng: 106.5193 },
      { id: 'serang', name: 'Serang', count: 8, lat: -6.12, lng: 106.1503 },
      { id: 'pandeglang', name: 'Pandeglang', count: 7, lat: -6.3084, lng: 106.1066 },
      { id: 'lebak', name: 'Lebak', count: 6, lat: -6.5644, lng: 106.2522 },
    ],
  },
  {
    id: 'bali',
    name: 'Bali',
    regions: [
      { id: 'tabanan', name: 'Tabanan', count: 17, lat: -8.5413, lng: 115.1252 },
      { id: 'bangli', name: 'Bangli (Kintamani)', count: 14, lat: -8.2422, lng: 115.3292 },
      { id: 'gianyar', name: 'Gianyar', count: 11, lat: -8.5449, lng: 115.3255 },
      { id: 'buleleng', name: 'Buleleng', count: 9, lat: -8.112, lng: 115.0882 },
    ],
  },
  {
    id: 'sumatera-utara',
    name: 'Sumatera Utara',
    regions: [
      { id: 'karo', name: 'Karo (Berastagi)', count: 21, lat: 3.1853, lng: 98.5049 },
      { id: 'simalungun', name: 'Simalungun', count: 12, lat: 2.9025, lng: 98.8986 },
      { id: 'deli-serdang', name: 'Deli Serdang', count: 10, lat: 3.4214, lng: 98.7042 },
    ],
  },
  {
    id: 'sulawesi-selatan',
    name: 'Sulawesi Selatan',
    regions: [
      { id: 'gowa', name: 'Gowa', count: 14, lat: -5.3167, lng: 119.75 },
      { id: 'enrekang', name: 'Enrekang', count: 12, lat: -3.5625, lng: 119.7764 },
      { id: 'bantaeng', name: 'Bantaeng', count: 8, lat: -5.5458, lng: 119.9469 },
    ],
  },
]

export const defaultLocation: SelectedLocation = {
  provinceId: 'jawa-barat',
  regionId: 'bandung-barat',
  label: 'Bandung Barat (Lembang)',
}

export function findNearestLocation(
  lat: number,
  lng: number
): SelectedLocation & {
  lat: number
  lng: number
} {
  let nearestProvince = provinceGroups[0]
  let nearestRegion = provinceGroups[0].regions[0]
  let minDistanceSq = Number.POSITIVE_INFINITY

  for (const province of provinceGroups) {
    for (const region of province.regions) {
      const dLat = region.lat - lat
      const dLng = region.lng - lng
      const distanceSq = dLat * dLat + dLng * dLng
      if (distanceSq < minDistanceSq) {
        minDistanceSq = distanceSq
        nearestProvince = province
        nearestRegion = region
      }
    }
  }

  return {
    provinceId: nearestProvince.id,
    regionId: nearestRegion.id,
    label: nearestRegion.name,
    lat: nearestRegion.lat,
    lng: nearestRegion.lng,
  }
}

export function findRegionCoordinates(
  provinceId: string,
  areaName: string
): { lat: number; lng: number } | null {
  const province = provinceGroups.find((item) => item.id === provinceId)
  if (!province) return null
  const region = province.regions.find((item) => item.name === areaName)
  if (region) return { lat: region.lat, lng: region.lng }
  const first = province.regions[0]
  return first ? { lat: first.lat, lng: first.lng } : null
}
